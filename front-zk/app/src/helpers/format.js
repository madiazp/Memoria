const format = {}

const localFormat = (input, size) => JSON.parse(input).map((x) =>'0x'+ x.toString(16).padStart(size,"0"));
format.toZokFormat32 = (input) => localFormat(input, 32);
format.toZokFormat8 = (input) => localFormat(input, 8);

export default format;
