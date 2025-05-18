import BankCard from '@/components/BankCard';
import HeaderBox from '@/components/HeaderBox';
import { getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { logger } from '@/lib/logger';

const log = logger.child({ page: 'my-banks' });

const MyBanks = async () => {
  log.info('Rendering My Banks page');
  const user = await getLoggedInUser();
  const accounts = await getAccounts({ userId: user?.$id });

  return (
    <section className="flex">
      <div className="my-banks">
        <HeaderBox
          title="My Bank Accounts"
          subtext="Effortlessly manage your banking activities"
        />
        <div className="space-y-4">
          <h2 className="header-2">Your Cards</h2>
          <div className="flex flex-wrap gap-6">
            {accounts &&
              accounts?.data.map((a: Account) => (
                <BankCard
                  key={accounts.id}
                  account={a}
                  username={`${user?.firstName} ${user?.lastName}`}
                />
              ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MyBanks;
