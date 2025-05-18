import { logger } from '@/lib/logger';

const log = logger.child({ components: 'HeaderBox' });

const HeaderBox = ({
  type = 'title',
  title,
  subtext,
  user,
}: HeaderBoxProps) => {
  log.debug('HeaderBox', { type, title, subtext, user });

  return (
    <div className="header-box">
      <h1 className="header-box-title">
        {title}
        {type === 'greeting' && (
          <span className="text-bankGradient">&nbsp;{user}</span>
        )}
      </h1>
      <p className="header-box-subtext">{subtext}</p>
    </div>
  );
};

export default HeaderBox;
