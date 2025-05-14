'use client';

import CountUp from 'react-countup';

const AnimatedCounter = ({ amount }: { amount: number }) => {
  return (
    <div>
      <CountUp end={amount} decimals={2} decimal="." prefix="$" />
    </div>
  );
};

export default AnimatedCounter;
