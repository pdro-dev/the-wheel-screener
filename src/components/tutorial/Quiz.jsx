import React, { useState } from 'react';
import { CheckCircle, XCircle, RotateCcw, Trophy, BookOpen } from 'lucide-react';

/**
 * Componente de quiz interativo para o tutorial
 * @param {Object} props
 * @param {Array} props.questions - Array de questões
 * @param {string} [props.title] - Título do quiz
 * @param {Function} [props.onComplete] - Callback quando quiz é completado
 */
export default function Quiz({ questions = [], title = "Quiz", onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);

  const question = questions[currentQuestion];
  const isLastQuestion = currentQuestion === questions.length - 1;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  const handleAnswerSelect = (answerIndex) => {
    if (showExplanation) return; // Não permite mudança após mostrar explicação
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === question.answerIndex;
    const newAnswer = {
      questionId: question.id,
      selectedIndex: selectedAnswer,
      isCorrect,
      timeSpent: Date.now() // Simplificado - em produção, calcular tempo real
    };

    setAnswers(prev => [...prev, newAnswer]);
    setShowExplanation(true);
  };

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      setIsCompleted(true);
      if (onComplete) {
        const score = answers.filter(a => a.isCorrect).length + 
                     (selectedAnswer === question.answerIndex ? 1 : 0);
        onComplete({
          score,
          total: questions.length,
          percentage: (score / questions.length) * 100,
          answers: [...answers, {
            questionId: question.id,
            selectedIndex: selectedAnswer,
            isCorrect: selectedAnswer === question.answerIndex
          }]
        });
      }
    } else {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers([]);
    setIsCompleted(false);
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (percentage) => {
    if (percentage >= 80) return 'Excelente! Você domina o conteúdo.';
    if (percentage >= 60) return 'Bom trabalho! Continue estudando.';
    return 'Continue praticando para melhorar.';
  };

  if (!questions.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-gray-500">Nenhuma questão disponível</div>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    const correctAnswers = answers.filter(a => a.isCorrect).length + 
                          (selectedAnswer === question.answerIndex ? 1 : 0);
    const percentage = (correctAnswers / questions.length) * 100;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="text-center">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Concluído!</h3>
          <div className={`text-4xl font-bold mb-2 ${getScoreColor(percentage)}`}>
            {correctAnswers}/{questions.length}
          </div>
          <div className={`text-lg font-medium mb-4 ${getScoreColor(percentage)}`}>
            {percentage.toFixed(0)}% de acertos
          </div>
          <p className="text-gray-600 mb-6">{getScoreMessage(percentage)}</p>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={handleRestart}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="text-sm text-gray-500">
          Questão {currentQuestion + 1} de {questions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progresso</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          {question.prompt}
        </h4>

        {/* Answer Choices */}
        <div className="space-y-3">
          {question.choices.map((choice, index) => {
            let buttonClass = "w-full p-4 text-left border rounded-lg transition-colors ";
            
            if (showExplanation) {
              if (index === question.answerIndex) {
                buttonClass += "border-green-500 bg-green-50 text-green-900";
              } else if (index === selectedAnswer && index !== question.answerIndex) {
                buttonClass += "border-red-500 bg-red-50 text-red-900";
              } else {
                buttonClass += "border-gray-200 bg-gray-50 text-gray-600";
              }
            } else if (selectedAnswer === index) {
              buttonClass += "border-blue-500 bg-blue-50 text-blue-900";
            } else {
              buttonClass += "border-gray-300 hover:border-gray-400 hover:bg-gray-50";
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={buttonClass}
                disabled={showExplanation}
              >
                <div className="flex items-center justify-between">
                  <span>{choice}</span>
                  {showExplanation && (
                    <div>
                      {index === question.answerIndex && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                      {index === selectedAnswer && index !== question.answerIndex && (
                        <XCircle className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Explanation */}
      {showExplanation && question.explanation && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="font-medium text-blue-900 mb-2">Explicação:</h5>
          <p className="text-blue-800">{question.explanation}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between">
        <div className="text-sm text-gray-500">
          {answers.length > 0 && (
            <span>
              Acertos: {answers.filter(a => a.isCorrect).length}/{answers.length}
            </span>
          )}
        </div>
        
        <div className="flex gap-3">
          {!showExplanation ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Confirmar Resposta
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              {isLastQuestion ? 'Finalizar Quiz' : 'Próxima Questão'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

