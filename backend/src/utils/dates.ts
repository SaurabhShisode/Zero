export const toDay = (date?: Date | string | number) => {
  const base = date ? new Date(date) : new Date()

  const istOffset = 5.5 * 60 * 60 * 1000
  const istTime = new Date(base.getTime() + istOffset)

  istTime.setHours(0, 0, 0, 0)

  return new Date(istTime.getTime() - istOffset)
}
