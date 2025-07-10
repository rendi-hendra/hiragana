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
import { useEffect, useState } from "react";
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
  );
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [counterSuccess, setCounterSuccess] = useState<number>(0);
  const [counterWrong, setCounterWrong] = useState<number>(0);
  const [answerWrong, updateAnswerWrong] = useImmer<string[]>([]);
  const [history, updateHistory] = useImmer<
    { question: string; correct: number; wrong: number; accuracy: number }[]
  >([]);
  const [localStorageAccuracy, setLocalStorageAccuracy] = useLocalStorage<
    number[]
  >("hiraganaAccuracy", []);
  const [accuracyArray, updateAccuracyArray] = useImmer<number[]>([]);

  useEffect(() => {
    if (localStorageAccuracy) {
      updateAccuracyArray(() => localStorageAccuracy);
    }
  }, []);

  function getAccuracy(): number {
    const total = counterSuccess + counterWrong;
    if (total === 0) return 0;
    return Math.round((counterSuccess / total) * 100);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const currentHiragana = shuffledHiragana[current];
    const index = hiraganaArray.indexOf(currentHiragana);
    const correctRomaji = romajiHiragana[index];
    const isCorrect = input.trim().toLowerCase() === correctRomaji;

    setAnswer(isCorrect);
    setMessage(
      isCorrect
        ? `Benar! Jawaban: ${correctRomaji}`
        : `Salah! Jawaban yang benar: ${correctRomaji}`
    );

    if (isCorrect) {
      setCounterSuccess((prev) => prev + 1);
    } else {
      setCounterWrong((prev) => prev + 1);
      updateAnswerWrong((draft) => {
        draft.push(currentHiragana);
      });
    }

    const total = counterSuccess + counterWrong + 1;
    const updatedCorrect = isCorrect ? counterSuccess + 1 : counterSuccess;
    const updatedWrong = isCorrect ? counterWrong : counterWrong + 1;
    const acc = Math.round((updatedCorrect / total) * 100);

    if (shuffledHiragana.length === 1) {
      updateAccuracyArray((draft) => {
        draft.push(acc);
        setLocalStorageAccuracy(draft);
      });
    }

    updateHistory((draft) => {
      draft.push({
        question: currentHiragana,
        correct: updatedCorrect,
        wrong: updatedWrong,
        accuracy: acc,
      });
    });

    setShuffledHiragana((prev) => {
      const newList = [...prev];
      newList.splice(current, 1);
      return newList;
    });

    setInput("");
    setCurrent((prev) => Math.max(0, prev - 1));
  }

  return (
    <>
      <div className="flex flex-col lg:flex-row items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 gap-6">
        <Card className="w-full max-w-md shadow-xl border-2 border-indigo-300">
          <form onSubmit={handleSubmit} className="p-4">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-indigo-700">
                Hiragana Trainer
              </CardTitle>
              <CardDescription>
                Latihan membaca huruf hiragana dengan romaji
              </CardDescription>
              <CardAction className="mt-2">
                <div className="text-sm text-gray-700">
                  Akurasi: <strong>{getAccuracy()}%</strong>
                </div>
                <div className="text-green-600 font-semibold ml-2">
                  Benar: {counterSuccess}
                </div>
                <div className="text-red-500 font-semibold ml-2">
                  Salah: {counterWrong}
                </div>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4">
                <div className="text-8xl text-center font-semibold text-indigo-800">
                  {shuffledHiragana.length === 0
                    ? `✅ Selesai!`
                    : shuffledHiragana[current]}
                </div>
                <div
                  className={`text-center text-lg font-medium ${
                    answer ? "text-green-600" : "text-red-600"
                  }`}
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
                  className="border-2 border-indigo-300 focus:ring-indigo-500"
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2 mt-4">
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                Submit
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200">
          <h2 className="text-lg font-bold text-center mb-2 text-indigo-700">
            Akurasi Tiap Sesi
          </h2>
          <LineChart
            width={400}
            height={250}
            data={accuracyArray.map((item, index) => ({
              name: `Sesi ${index + 1}`,
              accuracy: item,
            }))}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="accuracy" stroke="#4f46e5" />
          </LineChart>
        </div>
      </div>
    </>
  );
}

export default App;
