'use server';

import { Client } from 'dwolla-v2';
import { logger } from '@/lib/logger';

const log = logger.child({ actions: 'dwolla-actions' });

const getEnvironment = (): 'production' | 'sandbox' => {
  log.debug('getEnvironment');
  const environment = process.env.DWOLLA_ENV as string;

  switch (environment) {
    case 'sandbox':
      return 'sandbox';
    case 'production':
      return 'production';
    default:
      throw new Error(
        'Dwolla environment should either be set to `sandbox` or `production`',
      );
  }
};

const dwollaClient = new Client({
  environment: getEnvironment(),
  key: process.env.DWOLLA_KEY as string,
  secret: process.env.DWOLLA_SECRET as string,
});

// Create a Dwolla Funding Source using a Plaid Processor Token
export const createFundingSource = async (
  options: CreateFundingSourceOptions,
) => {
  try {
    log.info('createFundingSource');
    log.debug({ options });

    return await dwollaClient
      .post(`customers/${options.customerId}/funding-sources`, {
        name: options.fundingSourceName,
        plaidToken: options.plaidToken,
      })
      .then((res) => res.headers.get('location'));
  } catch (err) {
    log.error('Creating a Funding Source Failed: ', err);
  }
};

export const createOnDemandAuthorization = async () => {
  try {
    log.info('createOnDemandAuthorization');
    const onDemandAuthorization = await dwollaClient.post(
      'on-demand-authorizations',
    );
    const authLink = onDemandAuthorization.body._links;
    return authLink;
  } catch (err) {
    log.error('Creating an On Demand Authorization Failed: ', err);
  }
};

export const createDwollaCustomer = async (
  newCustomer: NewDwollaCustomerParams,
) => {
  try {
    log.info('createDwollaCustomer');
    log.debug({ newCustomer });
    return await dwollaClient
      .post('customers', newCustomer)
      .then((res) => res.headers.get('location'));
  } catch (err) {
    log.error('Creating a Dwolla Customer Failed: ', err);
  }
};

export const createTransfer = async ({
  sourceFundingSourceUrl,
  destinationFundingSourceUrl,
  amount,
}: TransferParams) => {
  try {
    log.info('createTransfer');
    log.debug({
      sourceFundingSourceUrl,
      destinationFundingSourceUrl,
      amount,
    });

    const requestBody = {
      _links: {
        source: {
          href: sourceFundingSourceUrl,
        },
        destination: {
          href: destinationFundingSourceUrl,
        },
      },
      amount: {
        currency: 'USD',
        value: amount,
      },
    };
    return await dwollaClient
      .post('transfers', requestBody)
      .then((res) => res.headers.get('location'));
  } catch (err) {
    log.error('Transfer fund failed: ', err);
  }
};

export const addFundingSource = async ({
  dwollaCustomerId,
  processorToken,
  bankName,
}: AddFundingSourceParams) => {
  try {
    log.info('addFundingSource');
    log.debug({
      dwollaCustomerId,
      processorToken,
      bankName,
    });

    // create dwolla auth link
    const dwollaAuthLinks = await createOnDemandAuthorization();

    // add funding source to the dwolla customer & get the funding source url
    const fundingSourceOptions = {
      customerId: dwollaCustomerId,
      fundingSourceName: bankName,
      plaidToken: processorToken,
      _links: dwollaAuthLinks,
    };
    return await createFundingSource(fundingSourceOptions);
  } catch (err) {
    log.error('Transfer fund failed: ', err);
  }
};
