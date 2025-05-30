import Copy from './Copy';
import Image from 'next/image';
import Link from 'next/link';
import { formatAmount } from '@/lib/utils';
import { logger } from '@/lib/logger';

const log = logger.child({ components: 'BankCard' });

const BankCard = ({
  account,
  username,
  showBalance = true,
}: CreditCardProps) => {
  log.debug('BankCard', { account, username, showBalance });

  return (
    <div className="flex flex-col">
      <Link
        href={`/transaction-history?id=${account?.appwriteItemId}`}
        className="bank-card"
      >
        <div className="bank-card_content">
          <div>
            <h1 className="text-16 font-semibold text-white">{account.name}</h1>
            <p className="font-ibm-plex-serif font-black text-white">
              {formatAmount(account.currentBalance)}
            </p>
          </div>
          <article className="flex flex-col gap-2">
            <div className="flex justify-between">
              <h1 className="text-12 font-semibold text-white">{username}</h1>
              <h2 className="text-12 font-semibold text-white">●● / ●●</h2>
            </div>
            <p className="text-14 font-semibold tracking-[1.1px] text-white">
              ●●●● ●●●● ●●●● <span className="text-16 ">{account?.mask}</span>
            </p>
          </article>
        </div>
        <div className="bank-card_icon">
          <Image src="/icons/Paypass.svg" alt="pay" width={20} height={24} />
          <Image
            src="/icons/mastercard.svg"
            alt="mastercard"
            width={45}
            height={32}
            className="ml-5"
          />
        </div>
        <Image
          src="/icons/lines.png"
          alt="lines"
          width={316}
          height={190}
          className="absolute top-0 left-0"
        />
      </Link>
      {showBalance && <Copy title={account?.shareableId} />}
    </div>
  );
};

export default BankCard;
