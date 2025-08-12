import nodemailer from 'nodemailer';
import { config } from '../config/index.js';
import { logger } from '../logger/index.js';

// Создаем транспортер для отправки email
const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: false, // true для 465, false для других портов
  auth: {
    user: config.email.user,
    pass: config.email.pass
  }
});

// Функция для отправки email
const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: config.email.user,
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    logger.debug(`Email отправлен: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Ошибка отправки email: ${error.message}`);
    throw error;
  }
};

// Функция для отправки уведомления о поддержке
const sendSupportEmail = async (from, subject, message) => {
  const html = `
    <h3>Новое сообщение в поддержку</h3>
    <p><strong>От:</strong> ${from}</p>
    <p><strong>Тема:</strong> ${subject}</p>
    <p><strong>Сообщение:</strong></p>
    <p>${message}</p>
    <hr>
    <p><em>Отправлено из системы BioMark Monitoring</em></p>
  `;

  return await sendEmail(
    config.email.user, // отправляем на адрес поддержки
    `Поддержка BioMark: ${subject}`,
    `От: ${from}\nТема: ${subject}\n\nСообщение:\n${message}`,
    html
  );
};

// Функция для отправки уведомления о критических показателях
const sendAlertEmail = async (patientName, sensorId, value, threshold) => {
  const subject = `КРИТИЧЕСКИЙ ПОКАЗАТЕЛЬ: ${patientName}`;
  const html = `
    <h2 style="color: red;">⚠️ КРИТИЧЕСКИЙ ПОКАЗАТЕЛЬ</h2>
    <p><strong>Пациент:</strong> ${patientName}</p>
    <p><strong>Датчик:</strong> ${sensorId}</p>
    <p><strong>Значение:</strong> ${value}</p>
    <p><strong>Порог:</strong> ${threshold}</p>
    <hr>
    <p><em>Автоматическое уведомление от системы BioMark Monitoring</em></p>
  `;

  return await sendEmail(
    config.email.user,
    subject,
    `КРИТИЧЕСКИЙ ПОКАЗАТЕЛЬ\nПациент: ${patientName}\nДатчик: ${sensorId}\nЗначение: ${value}\nПорог: ${threshold}`,
    html
  );
};

// Проверка подключения к SMTP
const verifyConnection = async () => {
  try {
    await transporter.verify();
    logger.debug('SMTP соединение установлено');
    return true;
  } catch (error) {
    logger.error(`Ошибка SMTP соединения: ${error.message}`);
    return false;
  }
};

// Экспортируем функции
export {
  sendEmail,
  sendSupportEmail,
  sendAlertEmail,
  verifyConnection
};

// Default экспорт
const mailer = {
  sendEmail,
  sendSupportEmail,
  sendAlertEmail,
  verifyConnection
};

export default mailer;
