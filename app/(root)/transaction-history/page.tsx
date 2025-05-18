import HeaderBox from '@/components/HeaderBox';
import TransactionsTable from '@/components/TransactionsTable';
import { Pagination } from '@/components/Pagination';
import { formatAmount } from '@/lib/utils';
import { getAccount, getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { logger } from '@/lib/logger';

const log = logger.child({ page: 'transaction-history' });

const TransactionHistory = async ({
  searchParams: { id, page },
}: SearchParamProps) => {
  log.info('Rendering Transaction History page', { id, page });
  const currentPage = Number(page as string) || 1;
  const user = await getLoggedInUser();
  const accounts = await getAccounts({ userId: user?.$id });

  if (!accounts) return null;

  const accountsData = accounts?.data;
  const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId;
  const account = await getAccount({ appwriteItemId });
  const accountData = account?.data;
  const transactions = account?.transactions || [];
  const rowsPerPage = 10;
  const totalPages = Math.ceil(transactions.length / rowsPerPage);
  const indexOfLastTransaction = currentPage * rowsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - rowsPerPage;
  const currentTransactions = transactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction,
  );

  return (
    <div className="transactions">
      <div className="transactions-header">
        <HeaderBox
          title="Transaction History"
          subtext="See your bank details and transactions"
        />
      </div>
      <div className="space-y-6">
        <div className="transactions-account">
          <div className="flex flex-col gap-2">
            <h2 className="text-18 font-bold text-white">
              {accountData?.name}
            </h2>
            <p className="text-14 text-blue-25">{accountData?.officialName}</p>
            <p className="text-14 font-semibold tracking-[1.1px] text-white">
              ●●●● ●●●● ●●●● {accountData?.mask}
            </p>
          </div>
          <div className="transactions-account-balance">
            <p className="text-14">Current Balance</p>
            <p className="text-24 text-center font-bold">
              {formatAmount(accountData?.currentBalance)}
            </p>
          </div>
        </div>
        <section className="flex w-full flex-col gap-6">
          <TransactionsTable transactions={currentTransactions} />
          {totalPages > 1 && (
            <div className="my-4 w-full">
              <Pagination totalPages={totalPages} page={currentPage} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default TransactionHistory;
