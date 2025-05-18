import AuthForm from '@/components/AuthForm';
import { logger } from '@/lib/logger';

const log = logger.child({ page: 'sign-in' });

const SignIn = () => {
  log.info('Rendering SignIn page');

  return (
    <section className="flex-center size-full max-sm:px-6">
      <AuthForm type="sign-in" />
    </section>
  );
};

export default SignIn;
