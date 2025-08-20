import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Send } from 'lucide-react';

/**
 * Widget de feedback para o tutorial
 * @param {Object} props
 * @param {Function} props.onSubmit - Callback para envio do feedback
 * @param {string} [props.sectionId] - ID da seção para identificação
 */
export default function FeedbackWidget({ onSubmit, sectionId }) {
  const [feedback, setFeedback] = useState(null); // 'helpful' | 'not-helpful' | null
  const [comment, setComment] = useState('');
  const [showComment, setShowComment] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFeedback = (type) => {
    setFeedback(type);
    if (type === 'not-helpful') {
      setShowComment(true);
    } else {
      // Feedback positivo pode ser enviado imediatamente
      handleSubmit(type, '');
    }
  };

  const handleSubmit = (feedbackType = feedback, commentText = comment) => {
    const feedbackData = {
      sectionId,
      feedback: feedbackType,
      comment: commentText,
      timestamp: new Date().toISOString()
    };

    if (onSubmit) {
      onSubmit(feedbackData);
    }

    setSubmitted(true);
    
    // Reset após 3 segundos
    setTimeout(() => {
      setSubmitted(false);
      setFeedback(null);
      setComment('');
      setShowComment(false);
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="text-green-700 font-medium">
          ✅ Obrigado pelo seu feedback!
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="text-sm font-medium text-gray-900 mb-3">
        Este conteúdo foi útil para você?
      </div>
      
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => handleFeedback('helpful')}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            feedback === 'helpful'
              ? 'bg-green-100 text-green-700 border border-green-300'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <ThumbsUp className="w-4 h-4" />
          Sim, útil
        </button>
        
        <button
          onClick={() => handleFeedback('not-helpful')}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            feedback === 'not-helpful'
              ? 'bg-red-100 text-red-700 border border-red-300'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          <ThumbsDown className="w-4 h-4" />
          Não muito
        </button>
      </div>

      {showComment && (
        <div className="space-y-3">
          <div className="flex items-start gap-2">
            <MessageSquare className="w-4 h-4 text-gray-500 mt-1" />
            <div className="flex-1">
              <label htmlFor="feedback-comment" className="block text-sm font-medium text-gray-700 mb-1">
                Como podemos melhorar? (opcional)
              </label>
              <textarea
                id="feedback-comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Sua sugestão ou comentário..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => handleSubmit()}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              Enviar Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

