import {
  TCreateContextAwareItemOpts,
  TCreateContextAwareMeetingItemOpts,
} from '../contextAwareTypes'

export const isContextAwareMeetingItem = (
  context: TCreateContextAwareItemOpts | undefined
): context is TCreateContextAwareMeetingItemOpts => {
  return context
    ? (context as TCreateContextAwareMeetingItemOpts).ownerId !== undefined
    : false
}
