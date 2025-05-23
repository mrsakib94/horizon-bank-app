'use client';

import CustomFormInput from './CustomFormInput';
import Image from 'next/image';
import Link from 'next/link';
import PlaidLink from './PlaidLink';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { authFormSchema } from '@/lib/utils';
import { signIn, signUp } from '@/lib/actions/user.actions';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const AuthForm = ({ type }: AuthFormProps) => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);

      if (type === 'sign-up') {
        const userData = {
          firstName: data.firstName!,
          lastName: data.lastName!,
          address1: data.address1!,
          city: data.city!,
          state: data.state!,
          postalCode: data.postalCode!,
          dateOfBirth: data.dateOfBirth!,
          ssn: data.ssn!,
          email: data.email,
          password: data.password,
        };

        const newUser = await signUp(userData);

        if (newUser) setUser(newUser);
      }

      if (type === 'sign-in') {
        const res = await signIn({
          email: data.email,
          password: data.password,
        });

        if (res) router.push('/');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="auth-form">
      <header className="flex flex-col gap-5 md:gap-8">
        <Link href="/" className="cursor-pointer flex items-center gap-1">
          <Image
            src="/icons/logo.svg"
            height={34}
            width={34}
            alt="horizon logo"
          />
          <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">
            Horizon
          </h1>
        </Link>
        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
            {user ? 'Link Account' : type === 'sign-in' ? 'Sign In' : 'Sign Up'}
          </h1>
          <p className="text-16 font-normal text-gray-600">
            {user
              ? 'Link your account to get started'
              : 'Please enter your details'}
          </p>
        </div>
      </header>
      {user ? (
        <div className="flex flex-col gap-4">
          <PlaidLink user={user} variant="primary" />
        </div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {type === 'sign-up' && (
                <>
                  <div className="flex gap-4">
                    <CustomFormInput
                      control={form.control}
                      name="firstName"
                      label="First Name"
                      placeholder="e.g. John"
                      type="text"
                    />
                    <CustomFormInput
                      control={form.control}
                      name="lastName"
                      label="Last Name"
                      placeholder="e.g. Doe"
                      type="text"
                    />
                  </div>
                  <CustomFormInput
                    control={form.control}
                    name="address1"
                    label="Address"
                    placeholder="Enter your street address"
                    type="text"
                  />
                  <CustomFormInput
                    control={form.control}
                    name="city"
                    label="City"
                    placeholder="e.g. New York"
                    type="text"
                  />
                  <div className="flex gap-4">
                    <CustomFormInput
                      control={form.control}
                      name="state"
                      label="State"
                      placeholder="e.g. NY"
                      type="text"
                    />
                    <CustomFormInput
                      control={form.control}
                      name="postalCode"
                      label="Postal Code"
                      placeholder="e.g. 10001"
                      type="text"
                    />
                  </div>
                  <div className="flex gap-4">
                    <CustomFormInput
                      control={form.control}
                      name="dateOfBirth"
                      label="Date of Birth"
                      placeholder="YYYY-MM-DD"
                      type="text"
                    />
                    <CustomFormInput
                      control={form.control}
                      name="ssn"
                      label="SSN"
                      placeholder="e.g. 123456789"
                      type="text"
                    />
                  </div>
                </>
              )}
              <CustomFormInput
                control={form.control}
                name="email"
                label="Email"
                placeholder="Enter your email"
                type="email"
              />
              <CustomFormInput
                control={form.control}
                name="password"
                label="Password"
                placeholder="Enter your password"
                type="password"
              />
              <div className="flex flex-col gap-4">
                <Button type="submit" disabled={isLoading} className="form-btn">
                  {isLoading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />{' '}
                      &nbsp;Loading...
                    </>
                  ) : type === 'sign-in' ? (
                    'Sign In'
                  ) : (
                    'Sign Up'
                  )}
                </Button>
              </div>
            </form>
          </Form>
          <footer className="flex justify-center gap-1">
            <p className="text-14 font-normal text-gray-600">
              {type === 'sign-in'
                ? "Don't have an account?"
                : 'Already have an account?'}
            </p>
            <Link
              href={type === 'sign-in' ? '/sign-up' : '/sign-in'}
              className="form-link"
            >
              {type === 'sign-in' ? 'Sign Up' : 'Sign In'}
            </Link>
          </footer>
        </>
      )}
    </section>
  );
};

export default AuthForm;
