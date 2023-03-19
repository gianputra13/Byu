// Create My Own Timestamp
const currentFormatDate = () => {
  const date = new Date();
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  minutes = minutes < 10 ? "0" + minutes : minutes;
  const strTime = `${hours}:${minutes}:${seconds}`;
  return `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()} ${strTime}`;
};

module.exports = { currentFormatDate };
