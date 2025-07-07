import React from 'react';

interface ResponseViewerProps {
  response: string;
  success: boolean;
  loading?: boolean;
  title?: string;
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({
  response,
  success,
  loading = false,
  title = 'Response',
}) => {
  if (loading) {
    return (
      <div className="response-section">
        <h4>{title}</h4>
        <div className="response-viewer loading">
          Loading...
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="response-section">
        <h4>{title}</h4>
        <div className="response-viewer">
          <em>No response yet</em>
        </div>
      </div>
    );
  }

  return (
    <div className="response-section">
      <h4 className={success ? 'success' : 'error'}>
        {title} {success ? '✅' : '❌'}
      </h4>
      <pre className={`response-viewer ${success ? 'success' : 'error'}`}>
        {response}
      </pre>
    </div>
  );
};