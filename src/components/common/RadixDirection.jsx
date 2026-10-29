import { Direction } from 'radix-ui'
import { useTranslation } from 'react-i18next'

export function RadixDirection({ children }) {
  const { i18n } = useTranslation()

  return <Direction.Provider dir={i18n.dir()}>{children}</Direction.Provider>
}
