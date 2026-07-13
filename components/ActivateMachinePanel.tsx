'use client'

import { FormEvent, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from '@/i18n/navigation'
import { inferPluginSlugFromMachineId } from '@/lib/license'

type ActivateMachinePanelProps = {
  initialMachineId?: string
}

export default function ActivateMachinePanel({ initialMachineId }: ActivateMachinePanelProps) {
  const t = useTranslations('activate')
  const router = useRouter()
  const [machineId, setMachineId] = useState(initialMachineId ?? '')
  const [invalid, setInvalid] = useState(false)

  const inputClass =
    'w-full border border-hairline bg-paper px-4 py-2.5 font-mono text-sm text-ink placeholder:text-graphite focus:border-pen focus:outline-none'
  const labelClass = 'mb-1.5 block font-mono text-xs text-graphite'

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const trimmedMachineId = machineId.trim().toUpperCase()
    const pluginSlug = inferPluginSlugFromMachineId(trimmedMachineId)

    if (!trimmedMachineId || !pluginSlug) {
      setInvalid(true)
      return
    }

    setInvalid(false)
    const params = new URLSearchParams()
    params.set('plugin', pluginSlug)
    params.set('machineId', trimmedMachineId)
    router.push(`/activate?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 space-y-4" noValidate>
      <div>
        <label htmlFor="activate-machine-id" className={labelClass}>
          {t('machineLabel')}
        </label>
        <input
          id="activate-machine-id"
          type="text"
          value={machineId}
          onChange={(event) => {
            setMachineId(event.target.value)
            if (invalid) setInvalid(false)
          }}
          className={inputClass}
          placeholder={t('machinePlaceholder')}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {invalid ? (
        <p className="font-mono text-sm text-red-600" role="alert">
          {t('invalidMachineId')}
        </p>
      ) : null}

      <button
        type="submit"
        className="inline-flex items-center bg-pen px-6 py-3 font-mono text-sm text-paper transition-opacity duration-150 hover:opacity-90"
      >
        {t('checkLicense')}
      </button>
    </form>
  )
}
