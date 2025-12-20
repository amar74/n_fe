import { useState } from 'react';
import {
  BarChart3,
  MessageSquare,
  Upload,
  FileText,
  Plus,
  X,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/shared';

interface Question {
  id: number;
  question: string;
  source: 'typed' | 'file' | 'pasted';
  timestamp: string;
}

export default function PerformanceTab() {
  const { toast } = useToast();
  const [interviewQuestions, setInterviewQuestions] = useState<Question[]>([]);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [showPasteDialog, setShowPasteDialog] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [pastedText, setPastedText] = useState('');
  const [questionsFile, setQuestionsFile] = useState<{
    name: string;
    size: string;
  } | null>(null);

  const preparationProgress = {
    materials: 75,
    teamPreparation: 60,
    presentation: 80,
    qaPreparation: 50,
  };

  const addQuestion = () => {
    if (newQuestion.trim()) {
      const question: Question = {
        id: Date.now(),
        question: newQuestion.trim(),
        source: 'typed',
        timestamp: new Date().toLocaleString(),
      };
      setInterviewQuestions([...interviewQuestions, question]);
      setNewQuestion('');
      setShowAddQuestion(false);
      toast.success('Question added successfully');
    }
  };

  const handlePasteQuestions = () => {
    if (pastedText.trim()) {
      const lines = pastedText
        .split('\n')
        .filter((line) => line.trim())
        .map((line) => line.trim());

      const newQuestions: Question[] = lines.map((line, index) => ({
        id: Date.now() + index,
        question: line,
        source: 'pasted',
        timestamp: new Date().toLocaleString(),
      }));

      setInterviewQuestions([...interviewQuestions, ...newQuestions]);
      setPastedText('');
      setShowPasteDialog(false);
      toast.success(`${newQuestions.length} questions added from pasted text`);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setQuestionsFile({
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
    });

    const sampleQuestions = [
      'How do you ensure compliance with safety regulations during bridge inspections?',
      'Can you describe a challenging project and how you overcame obstacles?',
      'What innovative technologies have you implemented in your previous work?',
      'How do you manage project timelines and budgets?',
    ];

    const newQuestions: Question[] = sampleQuestions.map((q, index) => ({
      id: Date.now() + index,
      question: q,
      source: 'file',
      timestamp: new Date().toLocaleString(),
    }));

    setInterviewQuestions([...interviewQuestions, ...newQuestions]);
    toast.success(`${file.name} uploaded and ${sampleQuestions.length} questions extracted`);
  };

  const removeQuestion = (id: number) => {
    setInterviewQuestions(interviewQuestions.filter((q) => q.id !== id));
    toast.success('Question removed');
  };

  return (
    <div className="space-y-6">
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-outfit text-[#1A1A1A]">
            <BarChart3 className="h-5 w-5 text-[#161950]" />
            Preparation Progress Metrics
          </CardTitle>
          <CardDescription className="font-outfit">
            Track preparation progress across different areas leading up to the interview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(preparationProgress).map(([metric, progress]) => (
              <div key={metric} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium font-outfit capitalize">
                    {metric.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-sm font-bold font-outfit">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between font-outfit text-[#1A1A1A]">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-[#161950]" />
              Expected Interview Questions
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-outfit text-[#161950] border-[#161950]"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload File
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Questions File</DialogTitle>
                    <DialogDescription>
                      Upload a document containing potential interview questions for preparation.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="border-2 border-dashed border-[#161950]/30 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-[#161950]" />
                      <p className="text-sm font-outfit text-gray-600 mb-3">
                        Select a file containing potential interview questions
                      </p>
                      <div className="relative inline-block">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Button variant="outline" className="font-outfit text-[#161950] border-[#161950]">
                          <Upload className="h-4 w-4 mr-2" />
                          Choose File
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 font-outfit">
                        Supported: PDF, Word, Text files
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showPasteDialog} onOpenChange={setShowPasteDialog}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-outfit text-[#161950] border-[#161950]"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Paste Text
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Paste Expected Questions</DialogTitle>
                    <DialogDescription>
                      Paste or type potential questions, one per line.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Paste potential interview questions here, one per line..."
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      rows={8}
                      className="resize-none font-outfit"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setPastedText('')}
                        className="font-outfit"
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={handlePasteQuestions}
                        disabled={!pastedText.trim()}
                        className="bg-[#161950] hover:bg-[#161950]/90 font-outfit"
                      >
                        Add Questions
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showAddQuestion} onOpenChange={setShowAddQuestion}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-outfit text-[#161950] border-[#161950]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Expected Question</DialogTitle>
                    <DialogDescription>
                      Add a question you expect might be asked during the interview.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Enter a potential interview question here..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      rows={3}
                      className="font-outfit"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowAddQuestion(false)}
                        className="font-outfit"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={addQuestion}
                        disabled={!newQuestion.trim()}
                        className="bg-[#161950] hover:bg-[#161950]/90 font-outfit"
                      >
                        Add Question
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardTitle>
          <CardDescription className="font-outfit">
            Prepare for potential questions that might be asked during the interview presentation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {questionsFile && (
            <div className="mb-4 p-3 bg-[#161950]/10 rounded-lg border border-[#161950]/20">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-[#161950]" />
                <span className="font-medium font-outfit">Uploaded: {questionsFile.name}</span>
                <span className="text-gray-500 font-outfit">({questionsFile.size})</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setQuestionsFile(null)}
                  className="ml-auto"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {interviewQuestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium font-outfit">No expected questions added yet</p>
              <p className="text-sm font-outfit">
                Use the buttons above to add potential questions for interview preparation.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {interviewQuestions.map((item, index) => (
                <Card key={item.id} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium font-outfit text-[#1A1A1A]">
                            Q{index + 1}:
                          </span>
                          <Badge
                            variant="outline"
                            className={`font-outfit ${
                              item.source === 'file'
                                ? 'bg-blue-50 text-blue-700'
                                : item.source === 'pasted'
                                ? 'bg-green-50 text-green-700'
                                : 'bg-[#161950]/10 text-[#161950]'
                            }`}
                          >
                            {item.source === 'file'
                              ? 'From File'
                              : item.source === 'pasted'
                              ? 'Pasted'
                              : 'Typed'}
                          </Badge>
                        </div>
                        <p className="text-gray-700 font-outfit mb-2">{item.question}</p>
                        <p className="text-xs text-gray-500 font-outfit">Added: {item.timestamp}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeQuestion(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

