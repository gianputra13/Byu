function formatDateTime(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
}

module.exports.Logging = {
  INFO: (tag, message) =>
    console.log(
      `\x1b[94m[${formatDateTime(new Date())}] [${tag}] ${message}\x1b[0m`
    ),
  ERROR: (tag, message) =>
    console.log(
      `\x1b[31m[${formatDateTime(new Date())}] [${tag}] ${message}\x1b[0m`
    ),
  WARNING: (tag, message) =>
    console.log(
      `\x1b[33m[${formatDateTime(new Date())}] [${tag}] ${message}\x1b[0m`
    ),
  SUCCESS: () =>
    console.log(
      `\x1b[32m[${formatDateTime(new Date())}] [${tag}] ${message}\x1b[0m`
    ),
};
