'use server';

import {
  CountryCode,
  ProcessorTokenCreateRequest,
  ProcessorTokenCreateRequestProcessorEnum,
  Products,
} from 'plaid';
import { ID, Query } from 'node-appwrite';
import { addFundingSource, createDwollaCustomer } from './dwolla.actions';
import { cookies } from 'next/headers';
import { createAdminClient, createSessionClient } from '../appwrite';
import { encryptId, extractCustomerIdFromUrl, parseStringify } from '../utils';
import { plaidClient } from '../plaid';
import { revalidatePath } from 'next/cache';

const {
  APPWRITE_DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID,
} = process.env;

export const getUserInfo = async ({ userId }: GetUserInfoProps) => {
  try {
    const { database } = await createAdminClient();

    const user = await database.listDocuments(
      APPWRITE_DATABASE_ID!,
      APPWRITE_USER_COLLECTION_ID!,
      [Query.equal('userId', [userId])],
    );

    return parseStringify(user.documents[0]);
  } catch (err) {
    console.error(err);
  }
};

export const signIn = async ({ email, password }: SignInProps) => {
  try {
    const { account } = await createAdminClient();
    const session = await account.createEmailPasswordSession(email, password);

    cookies().set('appwrite-session', session.secret, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });

    const user = await getUserInfo({ userId: session.userId });

    return parseStringify(user);
  } catch (err) {
    console.error(err);
  }
};

export const signUp = async ({ password, ...userData }: SignUpParams) => {
  try {
    let newUserAccount;
    const { email, firstName, lastName } = userData;
    const { account, database } = await createAdminClient();

    newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`,
    );

    if (!newUserAccount) throw new Error('Error creating user');

    const dwollaCustomerUrl = await createDwollaCustomer({
      ...userData,
      type: 'personal',
    });

    if (!dwollaCustomerUrl) throw new Error('Error creating Dwolla customer');

    const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

    const newUser = await database.createDocument(
      APPWRITE_DATABASE_ID!,
      APPWRITE_USER_COLLECTION_ID!,
      ID.unique(),
      {
        ...userData,
        userId: newUserAccount.$id,
        dwollaCustomerId,
        dwollaCustomerUrl,
      },
    );

    const session = await account.createEmailPasswordSession(email, password);

    cookies().set('appwrite-session', session.secret, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });

    return parseStringify(newUser);
  } catch (err) {
    console.error(err);
  }
};

export const getLoggedInUser = async () => {
  try {
    const { account } = await createSessionClient();
    const res = await account.get();
    const user = await getUserInfo({ userId: res.$id });

    return parseStringify(user);
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();

    cookies().delete('appwrite-session');

    await account.deleteSession('current');
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const createLinkToken = async (user: User) => {
  try {
    const tokenParams = {
      user: {
        client_user_id: user.$id,
      },
      client_name: `${user.firstName} ${user.lastName}`,
      products: ['auth', 'transactions'] as Products[],
      transactions: {
        days_requested: 730,
      },
      language: 'en',
      country_codes: ['US'] as CountryCode[],
    };

    const res = await plaidClient.linkTokenCreate(tokenParams);

    return parseStringify({ linkToken: res.data.link_token });
  } catch (err) {
    console.error(err);
  }
};

export const createBankAccount = async ({
  accessToken,
  userId,
  accountId,
  bankId,
  fundingSourceUrl,
  shareableId,
}: CreateBankAccountProps) => {
  try {
    const { database } = await createAdminClient();

    const bankAccount = await database.createDocument(
      APPWRITE_DATABASE_ID!,
      APPWRITE_BANK_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        accountId,
        bankId,
        accessToken,
        fundingSourceUrl,
        shareableId,
      },
    );

    return parseStringify(bankAccount);
  } catch (err) {
    console.error(err);
  }
};

export const exchangePublicToken = async ({
  publicToken,
  user,
}: ExchangePublicTokenProps) => {
  try {
    // Exchange public token for access token and item ID
    const res = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = res.data.access_token;
    const itemId = res.data.item_id;

    // Get account information from Plaid using the access token
    const accountRes = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accountData = accountRes.data.accounts[0];

    // Create a processor token for Dwolla using the access token and account ID
    const request: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: 'dwolla' as ProcessorTokenCreateRequestProcessorEnum,
    };

    const processorTokenResponse =
      await plaidClient.processorTokenCreate(request);
    const processorToken = processorTokenResponse.data.processor_token;

    // Create a funding source URL for the account using the Dwolla customer ID, processor token, and bank name
    const fundingSourceUrl = await addFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name,
    });

    // If the funding source URL is not created, throw an error
    if (!fundingSourceUrl) throw Error;

    // Create a bank account using the user ID, item ID, account ID, access token, funding source URL, and shareableId ID
    await createBankAccount({
      userId: user.$id,
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceUrl,
      shareableId: encryptId(accountData.account_id),
    });

    // Revalidate the path to reflect the changes
    revalidatePath('/');

    // Return a success message
    return parseStringify({
      publicTokenExchange: 'complete',
    });
  } catch (err) {
    console.error(err);
  }
};

export const getBanks = async ({ userId }: GetBanksProps) => {
  try {
    const { database } = await createAdminClient();

    const banks = await database.listDocuments(
      APPWRITE_DATABASE_ID!,
      APPWRITE_BANK_COLLECTION_ID!,
      [Query.equal('userId', [userId])],
    );

    return parseStringify(banks.documents);
  } catch (err) {
    console.error(err);
  }
};

export const getBank = async ({ documentId }: GetBankProps) => {
  try {
    const { database } = await createAdminClient();

    const bank = await database.listDocuments(
      APPWRITE_DATABASE_ID!,
      APPWRITE_BANK_COLLECTION_ID!,
      [Query.equal('$id', [documentId])],
    );

    return parseStringify(bank.documents[0]);
  } catch (err) {
    console.error(err);
  }
};

export const getBankByAccountId = async ({
  accountId,
}: GetBankByAccountIdProps) => {
  try {
    const { database } = await createAdminClient();

    const bank = await database.listDocuments(
      APPWRITE_DATABASE_ID!,
      APPWRITE_BANK_COLLECTION_ID!,
      [Query.equal('accountId', [accountId])],
    );

    if (bank.total !== 1) return null;

    return parseStringify(bank.documents[0]);
  } catch (err) {
    console.error(err);
  }
};
