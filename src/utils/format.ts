import type { Excursion } from "@/types/excursion";

export const format_people_left_title = (people_left: number): string => {
  if (people_left % 100 >= 11 && people_left % 100 <= 14) {
    return "мест";
  }

  const lastDigit = people_left % 10;

  if (lastDigit === 1) {
    return "место";
  } else if (lastDigit >= 2 && lastDigit <= 4) {
    return "места";
  } else {
    return "мест";
  }
}

export const getPeopleStatusClass = (excursion: Excursion) => {
  if (excursion.people_left === 0) return 'sold-out'
  if (excursion.people_left <= excursion.people_amount * 0.2) return 'few-left'
  return 'available'
}

export const getPeopleStatusText = (excursion: Excursion) => {
  if (excursion.people_left === 0) return 'Мест нет'
  if (excursion.people_left <= excursion.people_amount * 0.2) return 'Мало мест'
  return 'Есть места'
}

export const formatPrice = (price: number): string => {
  return `от ${price.toLocaleString('ru-RU')} ₽`
}

// Получение процента заполненности
export const getProgressPercentage = (card: Excursion) => {
  if (card.people_amount === 0) return 0
  const occupied = card.people_amount - card.people_left
  return (occupied / card.people_amount) * 100
}

// Получение класса для прогресс-бара
export const getProgressClass = (card: Excursion) => {
  const percentage = getProgressPercentage(card)
  if (percentage >= 90) return 'danger'
  if (percentage >= 70) return 'warning'
  return 'success'
}
