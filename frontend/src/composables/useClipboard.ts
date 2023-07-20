export default () => {
  return {
    copy: (text: string) => {
      navigator.clipboard.writeText(text);
    },
  };
};
