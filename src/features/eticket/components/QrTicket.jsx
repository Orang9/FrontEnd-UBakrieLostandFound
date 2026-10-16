import { QRCodeSVG } from 'qrcode.react';

export function QrTicket({ value }) {
  if (!value)
    throw new TypeError('A ticket value is required to render its QR code.');
  return <QRCodeSVG value={value} title="QR E-Ticket" />;
}
