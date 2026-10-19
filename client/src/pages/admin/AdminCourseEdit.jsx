import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiSave, FiPlus, FiTrash2, FiArrowLeft, FiUploadCloud, FiFileText, FiDownload } from 'react-icons/fi';
import api from '../../api/client';
import toast from 'react-hot-toast';
import { SUBJECTS_LIST } from '../../translations';
import CoverImageUpload from '../../components/CoverImageUpload';

export default function AdminCourseEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Forms
  const [sectionForm, setSectionForm] = useState({ title: '', description: '' });
  const [showSectionForm, setShowSectionForm] = useState(false);

  const [lessonForm, setLessonForm] = useState({ title: '', description: '', video_url: '', content: '', duration: '' });
  const [showLessonForm, setShowLessonForm] = useState(null); // section_id

  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '' });
  const [showAssignmentForm, setShowAssignmentForm] = useState(null); // lesson_id

  // Material upload state per lesson
  const [showMaterialForm, setShowMaterialForm] = useState(null); // lesson_id
  const [materialTitle, setMaterialTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const fileInputRef = useRef(null);

  const load = async () => {
    try {
      const res = await api.get(`/courses/${id}`);
      setCourse(res.data.course);
      setSections(res.data.sections);
    } catch {
      navigate('/admin/courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const saveCourse = async () => {
    setSaving(true);
    try {
      await api.put(`/courses/${id}`, course);
      toast.success('Курс өзгерістері сақталды!');
    } catch (err) {
      toast.error('Сақтау қатесі');
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async () => {
    try {
      await api.put(`/courses/${id}`, { is_published: !course.is_published });
      setCourse({ ...course, is_published: !course.is_published });
      toast.success(course.is_published ? 'Курс жабылды (черновик)' : 'Курс жарияланды!');
    } catch {
      toast.error('Қате');
    }
  };

  // Sections
  const addSection = async (e) => {
    e.preventDefault();
    try {
      await api.post('/sections', { course_id: parseInt(id), ...sectionForm });
      setSectionForm({ title: '', description: '' });
      setShowSectionForm(false);
      toast.success('Бөлім қосылды');
      load();
    } catch (err) {
      toast.error('Қате');
    }
  };

  const deleteSection = async (sectionId) => {
    if (!window.confirm('Бөлімді және барлық сабақтарын өшіруді растайсыз ба?')) return;
    try {
      await api.delete(`/sections/${sectionId}`);
      toast.success('Бөлім өшірілді');
      load();
    } catch { toast.error('Қате'); }
  };

  // Lessons
  const addLesson = async (e, sectionId) => {
    e.preventDefault();
    try {
      await api.post('/lessons', { section_id: sectionId, ...lessonForm });
      setLessonForm({ title: '', description: '', video_url: '', content: '', duration: '' });
      setShowLessonForm(null);
      toast.success('Бейнесабақ қосылды');
      load();
    } catch (err) {
      toast.error('Қате');
    }
  };

  const deleteLesson = async (lessonId) => {
    if (!window.confirm('Бұл сабақты өшіруді растайсыз ба?')) return;
    try {
      await api.delete(`/lessons/${lessonId}`);
      toast.success('Сабақ өшірілді');
      load();
    } catch { toast.error('Қате'); }
  };

  // Upload Material to Lesson
  const handleUploadMaterial = async (e, lessonId) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Файлды таңдаңыз');
      return;
    }
    setUploadingMaterial(true);
    const formData = new FormData();
    formData.append('lesson_id', lessonId);
    formData.append('title', materialTitle || selectedFile.name);
    formData.append('file', selectedFile);

    try {
      await api.post('/materials/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Материал жүктелді!');
      setMaterialTitle('');
      setSelectedFile(null);
      setShowMaterialForm(null);
      load();
    } catch (err) {
      toast.error('Жүктеу қатесі');
    } finally {
      setUploadingMaterial(false);
    }
  };

  // Assignments
  const addAssignment = async (e, lessonId) => {
    e.preventDefault();
    try {
      await api.post('/assignments', { lesson_id: lessonId, ...assignmentForm });
      setAssignmentForm({ title: '', description: '' });
      setShowAssignmentForm(null);
      toast.success('Тапсырма қосылды');
      load();
    } catch (err) {
      toast.error('Қате');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  if (!course) return null;

  return (
    <div className="animate-fade-in max-w-4xl pb-16">
      {/* Top Bar */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/courses')}
          className="p-2.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl"
        >
          <FiArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Курсты редакциялау</h1>
          <p className="text-xs text-slate-400">ҰБТ сабақтарын, бейнесілтемелерін және файлдарды басқару</p>
        </div>
        <button
          onClick={togglePublish}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            course.is_published
              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          {course.is_published ? '✓ Жарияланған' : 'Жабық (черновик)'}
        </button>
      </div>

      {/* Course Info Form */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 mb-8 shadow-sm">
        <h2 className="text-lg font-black text-slate-900 mb-4">Негізгі ақпарат</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Курс атауы</label>
            <input
              type="text"
              value={course.title || ''}
              onChange={e => setCourse({ ...course, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ҰБТ Пәні</label>
            <select
              value={course.category || ''}
              onChange={e => setCourse({ ...course, category: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 text-sm font-semibold"
            >
              {SUBJECTS_LIST.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Сипаттамасы</label>
            <textarea
              value={course.description || ''}
              onChange={e => setCourse({ ...course, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 text-sm"
            />
          </div>

          <CoverImageUpload
            value={course.thumbnail || ''}
            onChange={url => setCourse({ ...course, thumbnail: url })}
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ұзақтығы</label>
            <input
              type="text"
              value={course.duration || ''}
              onChange={e => setCourse({ ...course, duration: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 text-sm"
              placeholder="мысалы: 45 сағат немесе 30 сабақ"
            />
          </div>

          <button
            onClick={saveCourse}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 shadow-md transition-all text-sm disabled:opacity-50"
          >
            <FiSave size={16} /> {saving ? 'Сақталуда...' : 'Өзгерістерді сақтау'}
          </button>
        </div>
      </div>

      {/* Sections and Lessons */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-slate-900">Бөлімдер мен сабақтар</h2>
          <button
            onClick={() => setShowSectionForm(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 shadow-sm"
          >
            <FiPlus size={14} /> Жаңа бөлім қосу
          </button>
        </div>

        {/* Add Section Form */}
        {showSectionForm && (
          <form onSubmit={addSection} className="bg-sky-50 border border-sky-200 rounded-2xl p-5 mb-5 space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Жаңа бөлім (Тарау)</h3>
            <input
              type="text"
              required
              value={sectionForm.title}
              onChange={e => setSectionForm({ ...sectionForm, title: e.target.value })}
              placeholder="Мысалы: 1-бөлім. Сандар теориясы және теңдеулер"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
            />
            <input
              type="text"
              value={sectionForm.description}
              onChange={e => setSectionForm({ ...sectionForm, description: e.target.value })}
              placeholder="Сипаттамасы (міндетті емес)"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
            />
            <div className="flex gap-2 pt-1">
              <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold">Қосу</button>
              <button type="button" onClick={() => setShowSectionForm(false)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold">Бас тарту</button>
            </div>
          </form>
        )}

        {/* Sections Listing */}
        <div className="space-y-4">
          {sections.map((section, idx) => (
            <div key={section.id} className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              {/* Section Header */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200/60">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-sky-100 text-sky-700 rounded-xl flex items-center justify-center text-xs font-black">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{section.title}</h3>
                    {section.description && <p className="text-xs text-slate-500">{section.description}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      setShowLessonForm(section.id);
                      setLessonForm({ title: '', description: '', video_url: '', content: '', duration: '' });
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700 shadow-sm"
                    title="Сабақ қосу"
                  >
                    <FiPlus size={14} /> Бейнесабақ
                  </button>
                  <button
                    onClick={() => deleteSection(section.id)}
                    className="p-2 text-rose-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    title="Бөлімді өшіру"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Add Lesson to Section Form */}
              {showLessonForm === section.id && (
                <form onSubmit={e => addLesson(e, section.id)} className="p-5 bg-sky-50/70 border-b border-sky-200 space-y-3">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-sky-800">Жаңа бейнесабақ</h4>
                  <input
                    type="text"
                    required
                    value={lessonForm.title}
                    onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                    placeholder="Сабақ тақырыбы (мысалы: Прогрессиялар және олардың қасиеттері)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                  <input
                    type="text"
                    required
                    value={lessonForm.video_url}
                    onChange={e => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                    placeholder="YouTube сілтемесі (https://youtube.com/watch?v=... немесе https://youtu.be/...)"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                  <textarea
                    value={lessonForm.content}
                    onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })}
                    placeholder="Сабақ конспектісі немесе тезисі..."
                    rows={2}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={lessonForm.duration}
                      onChange={e => setLessonForm({ ...lessonForm, duration: e.target.value })}
                      placeholder="Ұзақтығы (мысалы: 25 мин)"
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                    <input
                      type="text"
                      value={lessonForm.description}
                      onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })}
                      placeholder="Қосымша түсініктеме"
                      className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                    />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="submit" className="px-4 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold">Сабақты қосу</button>
                    <button type="button" onClick={() => setShowLessonForm(null)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold">Бас тарту</button>
                  </div>
                </form>
              )}

              {/* Lessons list inside section */}
              {section.lessons && section.lessons.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {section.lessons.map(lesson => (
                    <div key={lesson.id} className="p-4 sm:p-5 pl-8 sm:pl-12 hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-bold text-slate-800 text-sm sm:text-base">{lesson.title}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs">
                            {lesson.duration && <span className="text-slate-400">⏱ {lesson.duration}</span>}
                            {lesson.video_url && (
                              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                                🎬 YouTube сілтемесі бар
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Button to attach Material */}
                          <button
                            onClick={() => {
                              setShowMaterialForm(lesson.id);
                              setMaterialTitle('');
                              setSelectedFile(null);
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold"
                            title="Материал/Файл жүктеу"
                          >
                            <FiUploadCloud size={14} /> Файл
                          </button>

                          {/* Button to add Assignment */}
                          <button
                            onClick={() => {
                              setShowAssignmentForm(lesson.id);
                              setAssignmentForm({ title: '', description: '' });
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg text-xs font-bold"
                            title="Тапсырма қосу"
                          >
                            <FiPlus size={14} /> Тапсырма
                          </button>

                          <button
                            onClick={() => deleteLesson(lesson.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                            title="Сабақты өшіру"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Upload Material Sub-Form */}
                      {showMaterialForm === lesson.id && (
                        <form onSubmit={e => handleUploadMaterial(e, lesson.id)} className="mt-3 p-4 bg-blue-50/80 rounded-2xl border border-blue-200 space-y-3">
                          <h5 className="text-xs font-bold text-blue-900 uppercase">Осы сабаққа материал (PDF, конспект) жүктеу</h5>
                          <input
                            type="text"
                            placeholder="Материал атауы (мысалы: 1-сабақ формулалары)"
                            value={materialTitle}
                            onChange={e => setMaterialTitle(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                          <input
                            type="file"
                            onChange={e => setSelectedFile(e.target.files[0])}
                            className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white cursor-pointer"
                          />
                          <div className="flex gap-2 pt-1">
                            <button
                              type="submit"
                              disabled={uploadingMaterial}
                              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm"
                            >
                              {uploadingMaterial ? 'Жүктелуде...' : 'Жүктеу'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowMaterialForm(null)}
                              className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                            >
                              Бас тарту
                            </button>
                          </div>
                        </form>
                      )}

                      {/* Add Assignment Sub-Form */}
                      {showAssignmentForm === lesson.id && (
                        <form onSubmit={e => addAssignment(e, lesson.id)} className="mt-3 p-4 bg-amber-50/80 rounded-2xl border border-amber-200 space-y-3">
                          <h5 className="text-xs font-bold text-amber-900 uppercase">Бекіту тапсырмасы</h5>
                          <input
                            type="text"
                            required
                            placeholder="Тапсырма тақырыбы"
                            value={assignmentForm.title}
                            onChange={e => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                          <textarea
                            placeholder="Тапсырма мәтіні немесе сұрақтары..."
                            rows={2}
                            value={assignmentForm.description}
                            onChange={e => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs"
                          />
                          <div className="flex gap-2 pt-1">
                            <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold">Тапсырманы қосу</button>
                            <button type="button" onClick={() => setShowAssignmentForm(null)} className="px-4 py-2 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold">Бас тарту</button>
                          </div>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  Бұл бөлімде сабақтар жоқ. Жоғарыдағы «+ Бейнесабақ» батырмасын басыңыз.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
