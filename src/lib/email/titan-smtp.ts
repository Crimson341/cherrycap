import { connect, type TLSSocket } from "node:tls";

const SMTP_HOST = "smtp.titan.email";
const SMTP_PORT = 465;

function sanitizeHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function dotStuff(value: string) {
  return value.replace(/(^|\r\n)\./g, "$1..");
}

async function readResponse(
  socket: TLSSocket,
) {
  let buffer = "";

  while (true) {
    const chunk = await new Promise<Uint8Array>((resolve, reject) => {
      const onData = (value: Uint8Array) => {
        cleanup();
        resolve(value);
      };
      const onError = (error: Error) => {
        cleanup();
        reject(error);
      };
      const onEnd = () => {
        cleanup();
        reject(new Error("Titan SMTP closed the connection unexpectedly"));
      };
      const cleanup = () => {
        socket.off("data", onData);
        socket.off("error", onError);
        socket.off("end", onEnd);
      };

      socket.once("data", onData);
      socket.once("error", onError);
      socket.once("end", onEnd);
    });

    buffer += new TextDecoder().decode(chunk);
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
  socket: TLSSocket,
  command: string,
) {
  await new Promise<void>((resolve, reject) => {
    socket.write(`${command}\r\n`, (error?: Error | null) => {
      if (error) reject(error);
      else resolve();
    });
  });
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
  const socket = await new Promise<TLSSocket>((resolve, reject) => {
    const connection = connect(
      { host: SMTP_HOST, port: SMTP_PORT, servername: SMTP_HOST },
      () => resolve(connection),
    );
    connection.once("error", reject);
  });

  try {
    await readResponse(socket);

    await writeCommand(socket, "EHLO cherrycapitalweb.com");
    await readResponse(socket);

    await writeCommand(socket, "AUTH LOGIN");
    await readResponse(socket);
    await writeCommand(socket, Buffer.from(from).toString("base64"));
    await readResponse(socket);
    await writeCommand(socket, Buffer.from(password).toString("base64"));
    await readResponse(socket);

    await writeCommand(socket, `MAIL FROM:<${from}>`);
    await readResponse(socket);
    await writeCommand(socket, `RCPT TO:<${to}>`);
    await readResponse(socket);
    await writeCommand(socket, "DATA");
    await readResponse(socket);

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

    await writeCommand(socket, message);
    await readResponse(socket);
    await writeCommand(socket, "QUIT");
  } finally {
    socket.end();
  }
}
