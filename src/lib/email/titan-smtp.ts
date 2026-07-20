import { connect, type Socket } from "cloudflare:sockets";

const SMTP_HOST = "smtp.titan.email";
const SMTP_PORT = 465;

function sanitizeHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function dotStuff(value: string) {
  return value.replace(/(^|\r\n)\./g, "$1..");
}

async function readResponse(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  decoder: TextDecoder,
) {
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) throw new Error("Titan SMTP closed the connection unexpectedly");

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\r\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const match = line.match(/^(\d{3})([ -])(.*)$/);
      if (!match || match[2] === "-") continue;

      const code = Number(match[1]);
      if (code >= 400) {
        throw new Error(`Titan SMTP ${code}: ${match[3]}`);
      }
      return code;
    }
  }
}

async function writeCommand(
  writer: WritableStreamDefaultWriter<Uint8Array>,
  encoder: TextEncoder,
  command: string,
) {
  await writer.write(encoder.encode(`${command}\r\n`));
}

export async function sendTitanEmail({
  password,
  from,
  to,
  replyTo,
  subject,
  text,
}: {
  password: string;
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  text: string;
}) {
  const socket: Socket = connect(
    { hostname: SMTP_HOST, port: SMTP_PORT },
    { secureTransport: "on" },
  );
  const reader = socket.readable.getReader();
  const writer = socket.writable.getWriter();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  try {
    await readResponse(reader, decoder);

    await writeCommand(writer, encoder, "EHLO cherrycapitalweb.com");
    await readResponse(reader, decoder);

    await writeCommand(writer, encoder, "AUTH LOGIN");
    await readResponse(reader, decoder);
    await writeCommand(writer, encoder, btoa(from));
    await readResponse(reader, decoder);
    await writeCommand(writer, encoder, btoa(password));
    await readResponse(reader, decoder);

    await writeCommand(writer, encoder, `MAIL FROM:<${from}>`);
    await readResponse(reader, decoder);
    await writeCommand(writer, encoder, `RCPT TO:<${to}>`);
    await readResponse(reader, decoder);
    await writeCommand(writer, encoder, "DATA");
    await readResponse(reader, decoder);

    const message = [
      `From: Cherry Capital Web <${from}>`,
      `To: ${to}`,
      `Reply-To: ${sanitizeHeader(replyTo)}`,
      `Subject: ${sanitizeHeader(subject)}`,
      "MIME-Version: 1.0",
      'Content-Type: text/plain; charset="UTF-8"',
      "Content-Transfer-Encoding: 8bit",
      "",
      dotStuff(text.replace(/\r?\n/g, "\r\n")),
      ".",
    ].join("\r\n");

    await writer.write(encoder.encode(`${message}\r\n`));
    await readResponse(reader, decoder);
    await writeCommand(writer, encoder, "QUIT");
  } finally {
    reader.releaseLock();
    writer.releaseLock();
    socket.close();
  }
}
