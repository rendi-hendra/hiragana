import "./App.css";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "./components/ui/input";
import { useState } from "react";
import { hiraganaArray, romajiHiragana } from "@/lib/hiragana";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";
import { useLocalStorage } from "react-use";
import { useImmer } from "use-immer";

// Fungsi untuk mengacak array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function App() {
  const [shuffledHiragana, setShuffledHiragana] = useState(() =>
    shuffleArray(hiraganaArray)
  ); // langsung acak
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [counterSuccess, setCounterSuccess] = useState<number>(0);
  const [counterWrong, setCounterWrong] = useState<number>(0);
  const [answerWrong, setAnswerWrong] = useState<string[]>();
  const [history, setHistory] = useState<
    { question: string; correct: number; wrong: number; accuracy: number }[]
  >([]);
  const [resultAccuracy, setResultAccuracy] = useLocalStorage<number[]>(
    "hiraganaAccuracy",
    []
  );

  const [accuracyArray, setAccuracyArray] = useImmer<number[]>([]);

  function getAccuracy(): number {
    const total = counterSuccess + counterWrong;
    if (total === 0) return 0;
    return Math.round((counterSuccess / total) * 100);
  }

  // Fungsi ketika tombol diklik
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const currentHiragana = shuffledHiragana[current];
    const index = hiraganaArray.indexOf(currentHiragana);
    const correctRomaji = romajiHiragana[index];

    if (input.trim().toLowerCase() === correctRomaji) {
      setAnswer(true);
      setMessage(`Benar! Jawaban: ${correctRomaji}`);
      setCounterSuccess((prev) => prev + 1);
    } else {
      setAnswer(false);
      setMessage(`Salah! Jawaban yang benar: ${correctRomaji}`);
      setCounterWrong((prev) => prev + 1);
      setAnswerWrong((prev) =>
        prev ? [...prev, currentHiragana] : [currentHiragana]
      );
    }

    // Simpan hasil ke dalam localStorage
    if (shuffledHiragana.length === 0) {
      setAccuracyArray((draft) => {
        draft.push(getAccuracy());
      });
      setResultAccuracy(accuracyArray);
    }
    console.log("Accuracy Array:", accuracyArray);
    console.log("Accuracy Array:", resultAccuracy);

    // Hapus hiragana saat ini dari daftar
    setShuffledHiragana((prev) => {
      const newList = [...prev];
      newList.splice(current, 1); // hapus item saat ini
      return newList;
    });

    // Reset input
    setInput("");

    const total = counterSuccess + counterWrong + 1; // +1 karena belum ditambahkan
    const updatedCorrect =
      input.trim().toLowerCase() === correctRomaji
        ? counterSuccess + 1
        : counterSuccess;
    const updatedWrong =
      input.trim().toLowerCase() === correctRomaji
        ? counterWrong
        : counterWrong + 1;
    const acc = Math.round((updatedCorrect / total) * 100);

    if (shuffledHiragana.length === 0) {
      setHistory((prev) => [
        ...prev,
        {
          question: currentHiragana,
          correct: updatedCorrect,
          wrong: updatedWrong,
          accuracy: acc,
        },
      ]);
    }

    // Reset current index ke 0 (atau biarkan tetap jika tidak out of bounds)
    setCurrent((prev) => Math.max(0, prev - 1));
  }

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <Card className="w-full max-w-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Hiragana</CardTitle>
            <CardDescription>Latihan membaca huruf hiragana</CardDescription>
            <CardAction>
              {/* {answerWrong} */}
              <div className="">{getAccuracy()}%</div>
              <span className="text-green-500">{counterSuccess}</span>
              <span className="text-red-500 ml-2">{counterWrong}</span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="text-8xl text-center">
                {shuffledHiragana.length === 0
                  ? `Latihan selesai! Akurasi: ${getAccuracy()}%`
                  : shuffledHiragana[current]}
              </div>
              <div
                className={
                  answer
                    ? "text-center text-lg text-green-600"
                    : "text-center text-lg text-red-600"
                }
              >
                {message}
              </div>
              <Input
                id="inputHiragana"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                required
                autoComplete="off"
                className="bg-gray-100 border-2 border-gray-400"
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-2 mt-5">
            <Button type="submit" className="w-full">
              Submit
            </Button>
          </CardFooter>
        </form>
      </Card>
      <LineChart
        width={600}
        height={300}
        data={(resultAccuracy ?? []).map((item, index) => ({
          name: `#${index + 1}`,
          accuracy: item,
        }))}
        margin={{ top: 20, right: 20, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0, 100]} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="accuracy" stroke="#8884d8" />
        {/* <Line type="monotone" dataKey="correct" stroke="#4ade80" />
        <Line type="monotone" dataKey="wrong" stroke="#f87171" /> */}
      </LineChart>
      {/* <div>{MyChart()}</div> */}
    </div>
  );
}

export default App;
