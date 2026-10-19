import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiArrowRight, FiCheck, FiDownload, FiSend, FiFileText, FiUploadCloud, FiTrash2 } from 'react-icons/fi';
import api from '../api/client';
import VideoPlayer from '../components/VideoPlayer';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import toast from 'react-hot-toast';

export default function LessonPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { t } = useLang();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sidebarSections, setSidebarSections] = useState([]);
  const [progress, setProgress] = useState([]);

  // Material upload state
  const [materialTitle, setMaterialTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const fileInputRef = useRef(null);

  const canManageMaterials = user && (user.role === 'admin' || user.role === 'instructor');

  const loadLesson = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/lessons/${id}`);
      setData(res.data);

      if (res.data.course) {
        const courseRes = await api.get(`/courses/${res.data.course.id}`);
        setSidebarSections(courseRes.data.sections);

        const progRes = await api.get(`/courses/${res.data.course.id}/progress`);
        setProgress(progRes.data.progress);
      }
    } catch (err) {
      toast.error('Ошибка загрузки урока');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLesson();
    window.scrollTo(0, 0);
  }, [id]);

  const handleComplete = async () => {
    try {
      await api.post(`/lessons/${id}/complete`);
      toast.success(t.lesson.completed);
      loadLesson();
    } catch (err) {
      toast.error('Ошибка');
    }
  };

  const handleSubmitAssignment = async (assignmentId) => {
    if (!submissionText.trim()) {
      toast.error('Введите текст ответа');
      return;
    }
    setSubmitting(true);
    try {
      await api.post(`/assignments/${assignmentId}/submit`, { content: submissionText });
      toast.success(t.lesson.submitted);
      setSubmissionText('');
      loadLesson();
    } catch (err) {
      toast.error('Ошибка отправки');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUploadMaterial = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Выберите файл');
      return;
    }
    setUploadingMaterial(true);
    const formData = new FormData();
    formData.append('lesson_id', id);
    formData.append('title', materialTitle || selectedFile.name);
    formData.append('file', selectedFile);

    try {
      await api.post('/materials/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Материал загружен');
      setMaterialTitle('');
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadLesson();
    } catch (err) {
      toast.error('Ошибка загрузки файла');
    } finally {
      setUploadingMaterial(false);
    }
  };

  const handleDeleteMaterial = async (matId) => {
    if (!window.confirm('Удалить этот материал?')) return;
    try {
      await api.delete(`/materials/${matId}`);
      toast.success('Материал удален');
      loadLesson();
    } catch (err) {
      toast.error('Ошибка удаления');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const { lesson, assignments, materials, course, prevLesson, nextLesson } = data;
  const isCompleted = data.progress?.completed;

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-64px)] animate-fade-in bg-[#f8fafc] text-slate-900">
      {/* Sidebar */}
      <div className="hidden lg:block w-80 flex-shrink-0 border-r border-slate-200 bg-white overflow-y-auto max-h-[calc(100vh-64px)] sticky top-16 p-4">
        <Sidebar
          course={course}
          sections={sidebarSections}
          currentLessonId={lesson.id}
          progress={progress}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
            <Link to={`/course/${course.id}`} className="hover:text-blue-600 transition-colors">
              {course.title}
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold truncate">{lesson.title}</span>
          </div>

          {/* YouTube Video Player Embed */}
          <div className="bg-black rounded-2xl overflow-hidden border border-slate-200 shadow-xl mb-6">
            <VideoPlayer url={lesson.video_url} />
          </div>

          {/* Lesson title & completion */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {lesson.title}
              </h1>
              {lesson.duration && (
                <p className="text-xs text-slate-500 mt-1">Длительность: {lesson.duration}</p>
              )}
            </div>

            <button
              onClick={handleComplete}
              className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
                isCompleted
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20'
              }`}
            >
              <FiCheck size={16} />
              {isCompleted ? t.lesson.completed : t.lesson.markComplete}
            </button>
          </div>

          {/* Notes / Content */}
          {(lesson.content || lesson.description) && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-3">
                Конспект урока:
              </h2>
              <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {lesson.content || lesson.description}
              </div>
            </div>
          )}

          {/* 📂 Materials Section */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FiFileText className="text-blue-600" /> {t.lesson.lessonMaterials}
              </h2>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
                {materials?.length || 0}
              </span>
            </div>

            {/* List */}
            {materials && materials.length > 0 ? (
              <div className="space-y-2 mb-6">
                {materials.map(material => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                        PDF
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {material.title || material.filename}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">{material.filename}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`/uploads/${material.filepath}`}
                        download={material.filename}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors"
                      >
                        <FiDownload size={13} /> {t.lesson.download}
                      </a>

                      {canManageMaterials && (
                        <button
                          onClick={() => handleDeleteMaterial(material.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Удалить"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-xs mb-6 bg-slate-50 p-4 rounded-xl text-center">
                {t.lesson.noMaterials}
              </p>
            )}

            {/* Teacher Upload Form */}
            {canManageMaterials && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-700 mb-3">{t.lesson.uploadMaterial}</p>

                <form onSubmit={handleUploadMaterial} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Название материала (например: Формулы ЕНТ PDF)..."
                      value={materialTitle}
                      onChange={e => setMaterialTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 placeholder-slate-400"
                    />
                  </div>

                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={e => setSelectedFile(e.target.files[0])}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={uploadingMaterial}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                  >
                    <FiUploadCloud size={14} />
                    {uploadingMaterial ? 'Загрузка...' : 'Загрузить материал'}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Assignments */}
          {assignments && assignments.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 mb-8 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 mb-4">
                {t.lesson.assignments}
              </h2>
              <div className="space-y-4">
                {assignments.map(assignment => (
                  <div key={assignment.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <h3 className="font-semibold text-slate-900 text-sm mb-1">{assignment.title}</h3>
                    {assignment.description && (
                      <p className="text-xs text-slate-600 mb-3 leading-relaxed">{assignment.description}</p>
                    )}

                    {assignment.submission ? (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                        <p className="text-xs font-bold text-emerald-700 mb-1">
                          {t.lesson.submitted}
                        </p>
                        <p className="text-xs text-slate-700">{assignment.submission.content}</p>
                      </div>
                    ) : (
                      <div>
                        <textarea
                          value={submissionText}
                          onChange={e => setSubmissionText(e.target.value)}
                          placeholder={t.lesson.answerPlaceholder}
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-600 min-h-[80px]"
                        />
                        <button
                          onClick={() => handleSubmitAssignment(assignment.id)}
                          disabled={submitting}
                          className="mt-2 flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                        >
                          <FiSend size={12} />
                          {submitting ? t.lesson.sending : t.lesson.sendAnswer}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Nav */}
          <div className="flex items-center justify-between border-t border-slate-200 pt-6">
            {prevLesson ? (
              <Link
                to={`/lesson/${prevLesson.id}`}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
              >
                <FiArrowLeft /> {prevLesson.title}
              </Link>
            ) : <div />}

            {nextLesson ? (
              <Link
                to={`/lesson/${nextLesson.id}`}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {nextLesson.title} <FiArrowRight />
              </Link>
            ) : <div />}
          </div>
        </div>
      </div>
    </div>
  );
}
