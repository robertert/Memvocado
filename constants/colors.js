import { list } from "firebase/storage";

export const Colors = {
  primary_100_30: "#F7F6BB30",
  primary_100: "#F7F6BB",
  primary_500: "#87A922",
  primary_700: "#206D14",
  accent_500: "#DFBD00",
  accent_500_30: "#DFBD0030",
  white: "white",
  grey: "grey",
  green: "#9BCF53",
  blue: "#1679AB",
  yellow: "#FFD93D",
  green: "#9BCF53",
  red: "#E74646",
  secBlue: "#5DEBD7",
  secGreen: "#416D19",
  secYellow: "#FF8400",
  secRed: "#FA9884",
  black: "black",
  lightGreen: "#9AB683",
};

export const Fonts = {
  primary: "Peace Sans",
  secondary: "Frank Serif",
};

export const Subjects = [
  "English",
  "Spanish",
  "French",
  "Math",
  "Science",
  "Biology",
  "Phisics",
  "Art",
  "Medicine",
];

export const SubjectsIndex = [0, 1, 2, 3];

export const generageRandomUid = function () {
  const uid = Date.now().toString(36) + Math.random().toString(36).substr(2);
  return uid;
};

const translator = {
  "\\n": "\n",
  "\\t": "\t",
  "\\n\\n": "\n\n",
};

export const csvToJson = (csv, seperator1, seperator2) => {
  if (translator[seperator2]) {
    seperator2 = translator[seperator2];
  }
  if (translator[seperator1]) {
    seperator1 = translator[seperator1];
  }
  const lines = csv.split(seperator2);
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    const obj = {};
    const currentLine = lines[i].split(seperator1);
    obj.front = currentLine[0]?.trim();
    obj.back = currentLine[1]?.trim();
    result.push(obj);
  }

  return result;
};
