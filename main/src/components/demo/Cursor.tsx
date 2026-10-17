import type { Ref } from 'react'
import { SOURCE_NAME } from './content'

/** The simulated pointer: an arrow with a red halo, plus the file it carries in the first scene. */
export function DemoCursor({ ref, carry }: { ref: Ref<HTMLDivElement>; carry: boolean }) {
  return (
    <div ref={ref} className="demo-cursor">
      <span className="demo-cursor-halo" />
      <span className="demo-cursor-ripple" />
      <svg className="demo-cursor-arrow" width="22" height="28" viewBox="0 0 22 28" aria-hidden>
        <path
          d="M2 2 L2 21.5 L7 16.8 L10.4 24.6 L13.8 23.1 L10.5 15.5 L17.4 15.5 Z"
          fill="#0f100f"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
      <span className={`demo-cursor-file ${carry ? 'is-on' : ''}`}>
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-matcha font-mono text-[10px] font-semibold uppercase">txt</span>
        {SOURCE_NAME}
      </span>
    </div>
  )
}
