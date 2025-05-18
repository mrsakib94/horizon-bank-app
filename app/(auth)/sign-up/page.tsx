import AuthForm from '@/components/AuthForm';
import { logger } from '@/lib/logger';

const log = logger.child({ page: 'sign-up' });

const SignUp = () => {
  log.info('Rendering SignUp page');

  return (
    <section className="flex-center size-full max-sm:px-6">
      <AuthForm type="sign-up" />
    </section>
  );
};

export default SignUp;
