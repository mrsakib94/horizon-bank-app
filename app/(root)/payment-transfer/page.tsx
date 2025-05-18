import HeaderBox from '@/components/HeaderBox';
import PaymentTransferForm from '@/components/PaymentTransferForm';
import { getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { logger } from '@/lib/logger';

const log = logger.child({ page: 'payment-transfer' });

const PaymentTransfer = async () => {
  log.info('Rendering Payment Transfer page');
  const user = await getLoggedInUser();
  const accounts = await getAccounts({ userId: user?.$id });

  if (!accounts) return null;

  const accountsData = accounts?.data;

  return (
    <section className="payment-transfer">
      <HeaderBox
        title="Payment Transfer"
        subtext="Please provide any specific details or notes related to payment transfer"
      />
      <section className="size-full pt-5">
        <PaymentTransferForm accounts={accountsData} />
      </section>
    </section>
  );
};

export default PaymentTransfer;
