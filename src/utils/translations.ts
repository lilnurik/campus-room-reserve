
export type Language = 'ru' | 'en';

type TranslationObject = {
  [key: string]: string | TranslationObject;
};

interface Translations {
  [lang: string]: {
    [key: string]: any;
  };
}

export const translations: Translations = {
  ru: {
    common: {
      home: 'Главная',
      profile: 'Профиль',
      booking: 'Бронирование',
      history: 'История',
      logout: 'Выйти',
      cancel: 'Отменить',
      confirm: 'Подтвердить',
      back: 'Назад',
      save: 'Сохранить',
      delete: 'Удалить',
      edit: 'Редактировать',
      details: 'Подробнее',
      search: 'Поиск',
      filter: 'Фильтр',
      all: 'Все',
      submit: 'Отправить',
    },
    dashboard: {
      title: 'Ваш Личный Кабинет',
      subtitle: 'Управляйте своими бронированиями и создавайте новые',
      bookRoom: 'Забронировать помещение',
      currentBookings: 'Текущие брони',
      currentBookingsDesc: 'Активные бронирования помещений',
      upcomingBookings: 'Предстоящие брони',
      upcomingBookingsDesc: 'Запланированные бронирования',
      bookingHistory: 'История бронирований',
      bookingHistoryDesc: 'Ваши прошлые бронирования',
      noActiveBookings: 'У вас нет активных бронирований',
      noUpcomingBookings: 'У вас нет предстоящих бронирований',
      noPastBookings: 'У вас нет прошлых бронирований',
      popularRooms: 'Популярные комнаты',
      availableNow: 'Доступные сейчас',
      available: 'Доступно',
    },
    booking: {
      room: 'Комната',
      building: 'Здание',
      date: 'Дата',
      time: 'Время',
      duration: 'Продолжительность',
      purpose: 'Цель',
      notes: 'Примечания',
      keyIssued: 'Ключ выдан',
      keyReturned: 'Ключ возвращен',
      accessCode: 'Код доступа',
      status: {
        pending: 'Ожидает подтверждения',
        confirmed: 'Подтверждено',
        cancelled: 'Отменено',
        completed: 'Завершено',
        overdue: 'Просрочено',
      },
    },
  },
  en: {
    common: {
      home: 'Home',
      profile: 'Profile',
      booking: 'Booking',
      history: 'History',
      logout: 'Logout',
      cancel: 'Cancel',
      confirm: 'Confirm',
      back: 'Back',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      details: 'Details',
      search: 'Search',
      filter: 'Filter',
      all: 'All',
      submit: 'Submit',
    },
    dashboard: {
      title: 'Your Dashboard',
      subtitle: 'Manage your bookings and create new ones',
      bookRoom: 'Book a Room',
      currentBookings: 'Current Bookings',
      currentBookingsDesc: 'Active room bookings',
      upcomingBookings: 'Upcoming Bookings',
      upcomingBookingsDesc: 'Scheduled bookings',
      bookingHistory: 'Booking History',
      bookingHistoryDesc: 'Your past bookings',
      noActiveBookings: 'You have no active bookings',
      noUpcomingBookings: 'You have no upcoming bookings',
      noPastBookings: 'You have no past bookings',
      popularRooms: 'Popular Rooms',
      availableNow: 'Available Now',
      available: 'Available',
    },
    booking: {
      room: 'Room',
      building: 'Building',
      date: 'Date',
      time: 'Time',
      duration: 'Duration',
      purpose: 'Purpose',
      notes: 'Notes',
      keyIssued: 'Key Issued',
      keyReturned: 'Key Returned',
      accessCode: 'Access Code',
      status: {
        pending: 'Pending',
        confirmed: 'Confirmed',
        cancelled: 'Cancelled',
        completed: 'Completed',
        overdue: 'Overdue',
      },
    },
  },
};
