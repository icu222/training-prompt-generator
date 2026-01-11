import React, { useState, useRef } from 'react';
import '../styles/WorkoutLogGenerator.css';

interface ApiKeys {
  claude: string;
  gemini: string;
  exaone: string;
}

interface ApiResult {
  claude: string;
  gemini: string;
  exaone: string;
}

interface ApiLoading {
  claude: boolean;
  gemini: boolean;
  exaone: boolean;
}

export const WorkoutLogGenerator: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    claude: '',
    gemini: '',
    exaone: '',
  });

  const [showInputAreas, setShowInputAreas] = useState({
    claude: false,
    gemini: false,
    exaone: false,
  });

  const [tempInputs, setTempInputs] = useState({
    claude: '',
    gemini: '',
    exaone: '',
  });

  const [results, setResults] = useState<ApiResult>({
    claude: '여기에 Claude 생성 결과가 표시됩니다.',
    gemini: '여기에 Gemini 생성 결과가 표시됩니다.',
    exaone: '여기에 EXAONE 생성 결과가 표시됩니다.',
  });

  const [loading, setLoading] = useState<ApiLoading>({
    claude: false,
    gemini: false,
    exaone: false,
  });

  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const memberInfoRef = useRef<HTMLTextAreaElement>(null);
  const workoutRoutineRef = useRef<HTMLTextAreaElement>(null);
  const requirementsRef = useRef<HTMLTextAreaElement>(null);

  const fileInputRefs = {
    claude: useRef<HTMLInputElement>(null),
    gemini: useRef<HTMLInputElement>(null),
    exaone: useRef<HTMLInputElement>(null),
  };

  const handleFileUpload = (provider: 'claude' | 'gemini' | 'exaone') => {
    const file = fileInputRefs[provider].current?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = (event.target?.result as string).trim();
        setApiKeys((prev) => ({ ...prev, [provider]: content }));
        setShowInputAreas((prev) => ({ ...prev, [provider]: false }));
      };
      reader.readAsText(file);
    }
  };

  const toggleInputArea = (provider: 'claude' | 'gemini' | 'exaone') => {
    setShowInputAreas((prev) => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  const saveApiKey = (provider: 'claude' | 'gemini' | 'exaone') => {
    if (tempInputs[provider]) {
      setApiKeys((prev) => ({ ...prev, [provider]: tempInputs[provider] }));
      setTempInputs((prev) => ({ ...prev, [provider]: '' }));
      setShowInputAreas((prev) => ({ ...prev, [provider]: false }));
    }
  };

  const generateWithClaude = async () => {
    if (!apiKeys.claude) {
      setResults((prev) => ({
        ...prev,
        claude: 'Claude API 키를 먼저 입력해주세요.',
      }));
      return;
    }

    const memberInfo = memberInfoRef.current?.value || '';
    const workoutRoutine = workoutRoutineRef.current?.value || '';
    const requirements = requirementsRef.current?.value || '';

    setLoading((prev) => ({ ...prev, claude: true }));

    try {
      const prompt = `You are acting as a fitness trainer who needs to write detailed workout logs for your clients. Your goal is to create a comprehensive, professional workout log entry based on member information and the workout session that took place today.

Here is the member information:
${memberInfo || 'No member information provided'}

Here is today's workout content:
${workoutRoutine}

Your task is to write a detailed workout log entry in Korean that covers the following elements:

1. **For each exercise performed:**
   - Which muscle groups or body parts are targeted
   - The specific purpose and benefits of the exercise
   - Why this particular exercise was chosen for this member (connecting to their specific conditions, weaknesses, or goals mentioned in the member info)
   - Any discomfort, pain, or issues that occurred during the exercise
   - How you addressed or modified the workout in response to any issues

2. **Overall session summary:**
   - The general focus of today's training session
   - How today's workout aligns with the member's fitness goals or addresses their physical concerns
   - Any notable progress or observations

3. **Format requirements:**
   - Write in a professional but friendly tone appropriate for a fitness trainer
   - The length should be approximately one A4 page (around 800-1000 characters in Korean)
   - Write in Korean
   - Use clear paragraph structure
   ${requirements ? `\n4. **Additional requirements:**\n${requirements}` : ''}

Now write the complete workout log entry. The log should be written entirely in Korean, be professionally formatted, and be approximately one A4 page in length. Make sure to naturally incorporate all the required elements (target muscles, exercise purposes, reasons for selection based on member conditions, any discomfort and responses) into a cohesive narrative.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKeys.claude,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 4096,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Claude API 호출 실패');
      }

      setResults((prev) => ({
        ...prev,
        claude: data.content[0].text,
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        claude: `Claude API 오류: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
    } finally {
      setLoading((prev) => ({ ...prev, claude: false }));
    }
  };

  const generateWithGemini = async () => {
    if (!apiKeys.gemini) {
      setResults((prev) => ({
        ...prev,
        gemini: 'Gemini API 키를 먼저 입력해주세요.',
      }));
      return;
    }

    const memberInfo = memberInfoRef.current?.value || '';
    const workoutRoutine = workoutRoutineRef.current?.value || '';
    const requirements = requirementsRef.current?.value || '';

    setLoading((prev) => ({ ...prev, gemini: true }));

    try {
      const prompt = `You are acting as a fitness trainer who needs to write detailed workout logs for your clients. Your goal is to create a comprehensive, professional workout log entry based on member information and the workout session that took place today.

Here is the member information:
${memberInfo || 'No member information provided'}

Here is today's workout content:
${workoutRoutine}

Your task is to write a detailed workout log entry in Korean that covers the following elements:

1. **For each exercise performed:**
   - Which muscle groups or body parts are targeted
   - The specific purpose and benefits of the exercise
   - Why this particular exercise was chosen for this member (connecting to their specific conditions, weaknesses, or goals mentioned in the member info)
   - Any discomfort, pain, or issues that occurred during the exercise
   - How you addressed or modified the workout in response to any issues

2. **Overall session summary:**
   - The general focus of today's training session
   - How today's workout aligns with the member's fitness goals or addresses their physical concerns
   - Any notable progress or observations

3. **Format requirements:**
   - Write in a professional but friendly tone appropriate for a fitness trainer
   - The length should be approximately one A4 page (around 800-1000 characters in Korean)
   - Write in Korean
   - Use clear paragraph structure
   ${requirements ? `\n4. **Additional requirements:**\n${requirements}` : ''}

Now write the complete workout log entry. The log should be written entirely in Korean, be professionally formatted, and be approximately one A4 page in length. Make sure to naturally incorporate all the required elements (target muscles, exercise purposes, reasons for selection based on member conditions, any discomfort and responses) into a cohesive narrative.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKeys.gemini}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'Gemini API 호출 실패');
      }

      setResults((prev) => ({
        ...prev,
        gemini: data.candidates[0].content.parts[0].text,
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        gemini: `Gemini API 오류: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
    } finally {
      setLoading((prev) => ({ ...prev, gemini: false }));
    }
  };

  const generateWithExaone = async () => {
    if (!apiKeys.exaone) {
      setResults((prev) => ({
        ...prev,
        exaone: 'EXAONE API 키를 먼저 입력해주세요.',
      }));
      return;
    }

    const memberInfo = memberInfoRef.current?.value || '';
    const workoutRoutine = workoutRoutineRef.current?.value || '';
    const requirements = requirementsRef.current?.value || '';

    setLoading((prev) => ({ ...prev, exaone: true }));

    try {
      const prompt = `You are acting as a fitness trainer who needs to write detailed workout logs for your clients. Your goal is to create a comprehensive, professional workout log entry based on member information and the workout session that took place today.

Here is the member information:
${memberInfo || 'No member information provided'}

Here is today's workout content:
${workoutRoutine}

Your task is to write a detailed workout log entry in Korean that covers the following elements:

1. **For each exercise performed:**
   - Which muscle groups or body parts are targeted
   - The specific purpose and benefits of the exercise
   - Why this particular exercise was chosen for this member (connecting to their specific conditions, weaknesses, or goals mentioned in the member info)
   - Any discomfort, pain, or issues that occurred during the exercise
   - How you addressed or modified the workout in response to any issues

2. **Overall session summary:**
   - The general focus of today's training session
   - How today's workout aligns with the member's fitness goals or addresses their physical concerns
   - Any notable progress or observations

3. **Format requirements:**
   - Write in a professional but friendly tone appropriate for a fitness trainer
   - The length should be approximately one A4 page (around 800-1000 characters in Korean)
   - Write in Korean
   - Use clear paragraph structure
   ${requirements ? `\n4. **Additional requirements:**\n${requirements}` : ''}

Now write the complete workout log entry. The log should be written entirely in Korean, be professionally formatted, and be approximately one A4 page in length. Make sure to naturally incorporate all the required elements (target muscles, exercise purposes, reasons for selection based on member conditions, any discomfort and responses) into a cohesive narrative.`;

      const response = await fetch(
        'https://api.friendli.ai/serverless/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKeys.exaone}`,
          },
          body: JSON.stringify({
            model: 'LGAI-EXAONE/K-EXAONE-236B-A23B',
            messages: [
              { role: 'system', content: '당신은 전문 헬스 트레이너입니다.' },
              { role: 'user', content: prompt },
            ],
            max_tokens: 4096,
          }),
        }
      );

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || 'EXAONE API 호출 실패');
      }

      setResults((prev) => ({
        ...prev,
        exaone: data.choices[0].message.content,
      }));
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        exaone: `EXAONE API 오류: ${error instanceof Error ? error.message : 'Unknown error'}`,
      }));
    } finally {
      setLoading((prev) => ({ ...prev, exaone: false }));
    }
  };

  const handleGenerate = async () => {
    const workoutRoutine = workoutRoutineRef.current?.value;

    if (!workoutRoutine) {
      alert('헬스 루틴을 입력해주세요.');
      return;
    }

    setShowResults(true);
    await Promise.all([generateWithClaude(), generateWithGemini(), generateWithExaone()]);
  };

  const copyToClipboard = (provider: 'claude' | 'gemini' | 'exaone') => {
    const text = results[provider];
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(provider);
        setTimeout(() => setCopied(null), 2000);
      });
    }
  };

  const getApiKeyStatus = (provider: 'claude' | 'gemini' | 'exaone') => {
    if (apiKeys[provider]) {
      return (
        <span className="text-green-400 text-sm font-mono">
          ✓ {apiKeys[provider].slice(0, 15)}...
        </span>
      );
    }
    return <span className="text-red-400 text-sm font-mono">미설정</span>;
  };

  const ApiKeyRow: React.FC<{
    provider: 'claude' | 'gemini' | 'exaone';
    label: string;
    placeholder: string;
  }> = ({ provider, label, placeholder }) => (
    <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 rounded-xl border border-orange-500/20">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-orange-400">{label}</span>
          {getApiKeyStatus(provider)}
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".txt"
            ref={fileInputRefs[provider]}
            className="hidden"
            onChange={() => handleFileUpload(provider)}
          />
          <button
            onClick={() => fileInputRefs[provider].current?.click()}
            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition flex items-center gap-2 text-sm shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            파일 선택
          </button>
          <button
            onClick={() => toggleInputArea(provider)}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            직접 입력
          </button>
        </div>
      </div>
      {showInputAreas[provider] && (
        <div className="mt-3">
          <div className="flex gap-2">
            <input
              type="password"
              placeholder={placeholder}
              value={tempInputs[provider]}
              onChange={(e) =>
                setTempInputs((prev) => ({
                  ...prev,
                  [provider]: e.target.value,
                }))
              }
              className="flex-1 px-4 py-2 bg-slate-700 text-white rounded-lg border-2 border-slate-600 focus:border-orange-500 focus:outline-none"
            />
            <button
              onClick={() => saveApiKey(provider)}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition"
            >
              저장
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"
              />
            </svg>
            <h1 className="text-4xl font-bold text-white">운동 일지 생성기</h1>
            <svg className="w-12 h-12 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <p className="text-slate-300 text-lg">AI 기반 전문 운동 일지 자동 생성</p>
        </div>

        {/* API Key Section */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6 border-2 border-orange-500/30 shadow-lg shadow-orange-500/10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">⚡ API 키 설정</h2>
          </div>

          <div className="space-y-4">
            <ApiKeyRow
              provider="claude"
              label="Claude API"
              placeholder="sk-ant-..."
            />
            <ApiKeyRow provider="gemini" label="Gemini API" placeholder="AIzaSy..." />
            <ApiKeyRow
              provider="exaone"
              label="EXAONE API"
              placeholder="friendli_token..."
            />
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-orange-500/20">
          <h2 className="text-xl font-bold text-white mb-4">입력 정보</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-300 mb-2 font-semibold">
                회원 정보 (선택사항)
              </label>
              <textarea
                ref={memberInfoRef}
                placeholder="예: 이름: 홍길동, 나이: 28세, 목표: 근력 향상, 체력 수준: 중급"
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none resize-none"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 font-semibold">
                오늘 진행한 헬스 루틴 *
              </label>
              <textarea
                ref={workoutRoutineRef}
                placeholder="예:&#10;벤치프레스 3세트 10회 80kg&#10;스쿼트 4세트 12회 100kg&#10;데드리프트 3세트 8회 120kg"
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none resize-none"
                rows={6}
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-2 font-semibold">
                운동 일지 작성 요구사항 (선택사항)
              </label>
              <textarea
                ref={requirementsRef}
                placeholder="예: 각 운동의 자세 피드백 포함, 다음 주 목표 무게 제안, 부상 예방 팁 추가"
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-orange-500 focus:outline-none resize-none"
                rows={3}
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold rounded-lg hover:from-orange-700 hover:to-orange-600 transition shadow-lg"
          >
            운동 일지 생성하기
          </button>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="bg-slate-800 rounded-xl p-6 border border-orange-500/20">
            <h2 className="text-xl font-bold text-white mb-4">생성 결과</h2>
            <div className="grid grid-cols-3 gap-4">
              {/* Claude Result */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-orange-400">Claude</h3>
                  <button
                    onClick={() => copyToClipboard('claude')}
                    className="px-3 py-1.5 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600 transition flex items-center gap-2"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                          copied === 'claude'
                            ? 'M5 13l4 4L19 7'
                            : 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                        }
                      />
                    </svg>
                    {copied === 'claude' ? '복사됨' : '복사'}
                  </button>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 h-[700px] overflow-y-auto">
                  {loading.claude ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="spinner"></div>
                    </div>
                  ) : (
                    <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {results.claude}
                    </pre>
                  )}
                </div>
              </div>

              {/* Gemini Result */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-orange-400">Gemini</h3>
                  <button
                    onClick={() => copyToClipboard('gemini')}
                    className="px-3 py-1.5 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600 transition flex items-center gap-2"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                          copied === 'gemini'
                            ? 'M5 13l4 4L19 7'
                            : 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                        }
                      />
                    </svg>
                    {copied === 'gemini' ? '복사됨' : '복사'}
                  </button>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 h-[700px] overflow-y-auto">
                  {loading.gemini ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="spinner"></div>
                    </div>
                  ) : (
                    <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {results.gemini}
                    </pre>
                  )}
                </div>
              </div>

              {/* EXAONE Result */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-orange-400">EXAONE</h3>
                  <button
                    onClick={() => copyToClipboard('exaone')}
                    className="px-3 py-1.5 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600 transition flex items-center gap-2"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={
                          copied === 'exaone'
                            ? 'M5 13l4 4L19 7'
                            : 'M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z'
                        }
                      />
                    </svg>
                    {copied === 'exaone' ? '복사됨' : '복사'}
                  </button>
                </div>
                <div className="bg-slate-900 rounded-lg p-4 h-[700px] overflow-y-auto">
                  {loading.exaone ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="spinner"></div>
                    </div>
                  ) : (
                    <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">
                      {results.exaone}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
