'use server';

import { ID } from 'node-appwrite';
import { cookies } from 'next/headers';
import { createAdminClient, createSessionClient } from '../appwrite';
import { parseStringify } from '../utils';

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

    return parseStringify(session);
  } catch (err) {
    console.error(err);
  }
};

export const signUp = async (userData: SignUpParams) => {
  try {
    const { email, password, firstName, lastName } = userData;
    const { account } = await createAdminClient();

    const newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`,
    );
    const session = await account.createEmailPasswordSession(email, password);

    cookies().set('appwrite-session', session.secret, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });

    return parseStringify(newUserAccount);
  } catch (err) {
    console.error(err);
  }
};

export const getLoggedInUser = async () => {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();

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
