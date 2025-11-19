type Props = {
  target: number
  plan: number
  actual: number
  effPct: number
}

/**
 *
 * Bottom yellow KPI bar with four columns (TARGET, PLAN, ACTUAL, EFF %).
 */
export function SummaryBar({ target, plan, actual, effPct }: Props) {
  const items: Array<{ label: string; value: string | number }> = [
    { label: 'TARGET', value: target },
    { label: 'PLAN', value: plan },
    { label: 'ACTUAL', value: actual },
    { label: 'EFF %', value: `${effPct}%` },
  ]

  return (
    <div className='border-4 border-black rounded-md'>
      <div className='grid grid-cols-4'>
        {items.map((item, idx) => (
          <div
            key={item.label}
            className={[
              'bg-accent-yellow text-center',
              'border-black',
              idx === 0 ? '' : 'border-l-4',
            ].join(' ')}
          >
            <div className='font-bold uppercase border-b-2 border-black py-1 text-xl'>
              {item.label}
            </div>
            <div className='font-bold text-5xl leading-none py-3 bg-yellow-300'>
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
