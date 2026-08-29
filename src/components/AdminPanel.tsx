import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  Award,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Compass,
  Download,
  Eye,
  Filter,
  HelpCircle,
  MessageCircleHeart,
  Mountain,
  RefreshCw,
  School,
  Search,
  ShieldAlert,
  Star,
  Trash2,
  TrendingUp,
  Trophy,
  Users,
  Waves,
  X
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import type { MetricasQuiz } from './Quiz';

type Agente = {
  id: string;
  created_at: string | null;
  nombre: string | null;
  institucion: string | null;
  edad: number | null;
  avatar: string | null;
  nivel: number | null;
  mision_diagnostico: boolean | null;
  mision_volcan: boolean | null;
  mision_inundacion: boolean | null;
  mision_sismo: boolean | null;
  mision_evacuacion: boolean | null;
  metricas_quiz?: MetricasQuiz | null;
  ultima_conexion: string | null;
};

type EstadoFiltro = 'todos' | 'completos' | 'pendientes';

type Sugerencia = {
  id: string;
  created_at: string | null;
  nombre: string | null;
  institucion: string | null;
  calificacion: number;
  comentario: string | null;
};

const AdminPanel = () => {
  const [agentes, setAgentes] = useState<Agente[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [escuelaFiltro, setEscuelaFiltro] = useState('todas');
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>('todos');
  const [registroSeleccionado, setRegistroSeleccionado] = useState<Agente | null>(null);
  const [agenteDetalle, setAgenteDetalle] = useState<Agente | null>(null);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(() => new Set());
  const [confirmarEliminacionMasiva, setConfirmarEliminacionMasiva] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deletingBulk, setDeletingBulk] = useState(false);
  const [sugerencias, setSugerencias] = useState<Sugerencia[]>([]);
  const [sugerenciaSeleccionada, setSugerenciaSeleccionada] = useState<Sugerencia | null>(null);
  const [confirmarEliminarTodasSugerencias, setConfirmarEliminarTodasSugerencias] = useState(false);
  const [deletingSugerenciaId, setDeletingSugerenciaId] = useState<string | null>(null);
  const [deletingAllSugerencias, setDeletingAllSugerencias] = useState(false);

  const cargarDatos = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase
        .from('agentes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const registros = (data || []) as Agente[];
      const idsExistentes = new Set(registros.map((item) => item.id));
      setAgentes(registros);
      setSeleccionados((prev) => new Set(Array.from(prev).filter((id) => idsExistentes.has(id))));
    } catch (error) {
      console.error(error);
      setErrorMsg('No se pudieron cargar los registros. Revisa las variables de Supabase y las políticas RLS.');
    } finally {
      setLoading(false);
    }
  };

  const cargarSugerencias = async () => {
    try {
      const { data, error } = await supabase
        .from('sugerencias')
        .select('id, created_at, nombre, institucion, calificacion, comentario')
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;
      setSugerencias((data || []) as Sugerencia[]);
    } catch (error) {
      console.warn('No se pudieron cargar las sugerencias:', error);
    }
  };

  useEffect(() => {
    cargarDatos();
    cargarSugerencias();
  }, []);

  const escuelas = useMemo(() => {
    return Array.from(new Set(agentes.map((a) => a.institucion || 'Sin institución'))).sort();
  }, [agentes]);

  const agentesFiltrados = useMemo(() => {
    const q = normalizar(busqueda);

    return agentes.filter((agente) => {
      const nombre = normalizar(agente.nombre || '');
      const escuela = agente.institucion || 'Sin institución';
      const progreso = obtenerProgreso(agente);

      const coincideBusqueda = !q || nombre.includes(q) || normalizar(escuela).includes(q);
      const coincideEscuela = escuelaFiltro === 'todas' || escuela === escuelaFiltro;
      const coincideEstado =
        estadoFiltro === 'todos' ||
        (estadoFiltro === 'completos' && progreso === 100) ||
        (estadoFiltro === 'pendientes' && progreso < 100);

      return coincideBusqueda && coincideEscuela && coincideEstado;
    });
  }, [agentes, busqueda, escuelaFiltro, estadoFiltro]);

  const idsFiltrados = useMemo(() => agentesFiltrados.map((agente) => agente.id), [agentesFiltrados]);
  const todosFiltradosSeleccionados = idsFiltrados.length > 0 && idsFiltrados.every((id) => seleccionados.has(id));
  const seleccionadosVisibles = idsFiltrados.filter((id) => seleccionados.has(id)).length;

  const stats = useMemo(() => {
    const total = agentesFiltrados.length;
    const completados = agentesFiltrados.filter((a) => obtenerProgreso(a) === 100).length;
    const progresoPromedio = total
      ? Math.round(agentesFiltrados.reduce((acc, a) => acc + obtenerProgreso(a), 0) / total)
      : 0;
    const escuelasActivas = new Set(agentesFiltrados.map((a) => a.institucion || 'Sin institución')).size;

    return { total, completados, progresoPromedio, escuelasActivas };
  }, [agentesFiltrados]);

  const alternarSeleccion = (id: string) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const alternarTodosFiltrados = () => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      if (todosFiltradosSeleccionados) idsFiltrados.forEach((id) => next.delete(id));
      else idsFiltrados.forEach((id) => next.add(id));
      return next;
    });
  };

  const limpiarSeleccion = () => setSeleccionados(new Set());

  const eliminarRegistro = async () => {
    if (!registroSeleccionado) return;

    if (!isSupabaseConfigured) {
      setErrorMsg('Supabase no está configurado. No se puede eliminar desde el panel.');
      setRegistroSeleccionado(null);
      return;
    }

    setDeletingId(registroSeleccionado.id);
    setErrorMsg('');

    try {
      const { error } = await supabase.from('agentes').delete().eq('id', registroSeleccionado.id);
      if (error) throw error;

      const deletedId = registroSeleccionado.id;
      setAgentes((prev) => prev.filter((item) => item.id !== deletedId));
      setSeleccionados((prev) => {
        const next = new Set(prev);
        next.delete(deletedId);
        return next;
      });
      setRegistroSeleccionado(null);
    } catch (error) {
      console.error(error);
      setErrorMsg('No se pudo eliminar el registro. Verifica que exista una política DELETE en Supabase.');
    } finally {
      setDeletingId(null);
    }
  };

  const eliminarSeleccionados = async () => {
    const ids = Array.from(seleccionados);
    if (ids.length === 0) return;

    if (!isSupabaseConfigured) {
      setErrorMsg('Supabase no está configurado. No se pueden eliminar registros desde el panel.');
      setConfirmarEliminacionMasiva(false);
      return;
    }

    setDeletingBulk(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.from('agentes').delete().in('id', ids);
      if (error) throw error;

      const idsEliminados = new Set(ids);
      setAgentes((prev) => prev.filter((item) => !idsEliminados.has(item.id)));
      setSeleccionados(new Set());
      setConfirmarEliminacionMasiva(false);
    } catch (error) {
      console.error(error);
      setErrorMsg('No se pudieron eliminar los registros seleccionados. Verifica la política DELETE en Supabase.');
    } finally {
      setDeletingBulk(false);
    }
  };

  const eliminarSugerencia = async (id: string) => {
    if (!isSupabaseConfigured) {
      setErrorMsg('Supabase no está configurado. No se pueden eliminar sugerencias.');
      setSugerenciaSeleccionada(null);
      return;
    }

    setDeletingSugerenciaId(id);
    setErrorMsg('');

    try {
      const { error } = await supabase.from('sugerencias').delete().eq('id', id);
      if (error) throw error;

      setSugerencias((prev) => prev.filter((item) => item.id !== id));
      setSugerenciaSeleccionada(null);
    } catch (error) {
      console.error(error);
      setErrorMsg('No se pudo eliminar la sugerencia. Verifica que exista una política DELETE en la tabla sugerencias.');
    } finally {
      setDeletingSugerenciaId(null);
    }
  };

  const eliminarTodasSugerencias = async () => {
    if (!isSupabaseConfigured) {
      setErrorMsg('Supabase no está configurado. No se pueden eliminar sugerencias.');
      setConfirmarEliminarTodasSugerencias(false);
      return;
    }

    setDeletingAllSugerencias(true);
    setErrorMsg('');

    try {
      const { error } = await supabase.from('sugerencias').delete().not('id', 'is', null);
      if (error) throw error;

      setSugerencias([]);
      setConfirmarEliminarTodasSugerencias(false);
    } catch (error) {
      console.error(error);
      setErrorMsg('No se pudieron eliminar todas las sugerencias. Verifica la política DELETE en la tabla sugerencias.');
    } finally {
      setDeletingAllSugerencias(false);
    }
  };

  const exportarCSV = () => {
    const origen = seleccionados.size > 0
      ? agentesFiltrados.filter((agente) => seleccionados.has(agente.id))
      : agentesFiltrados;

    const encabezado = [
      'Nombre',
      'Edad',
      'Institución',
      'Nivel',
      'Progreso (%)',
      'Total Aciertos',
      'Total Errores',
      'Efectividad (%)',
      'Diagnóstico Estado',
      'Diagnóstico (Aciertos/Errores)',
      'Volcán Estado',
      'Volcán (Aciertos/Errores)',
      'Inundación Estado',
      'Inundación (Aciertos/Errores)',
      'Sismo Estado',
      'Sismo (Aciertos/Errores)',
      'Evacuación Estado',
      'Evacuación (Aciertos/Errores)',
      'Fecha Registro',
      'Última Conexión'
    ];

    const filas = origen.map((a) => {
      const met = obtenerMetricas(a);
      const mq = a.metricas_quiz?.misiones || {};

      const diagA = mq.diagnostico ? `${mq.diagnostico.aciertos}A / ${mq.diagnostico.errores}E` : (a.mision_diagnostico ? '10A / 0E' : 'Pendiente');
      const volcA = mq.volcan ? `${mq.volcan.aciertos}A / ${mq.volcan.errores}E` : (a.mision_volcan ? '3A / 0E' : 'Pendiente');
      const inunA = mq.inundacion ? `${mq.inundacion.aciertos}A / ${mq.inundacion.errores}E` : (a.mision_inundacion ? '3A / 0E' : 'Pendiente');
      const sismA = mq.sismo ? `${mq.sismo.aciertos}A / ${mq.sismo.errores}E` : (a.mision_sismo ? '3A / 0E' : 'Pendiente');
      const evacA = mq.evacuacion ? `${mq.evacuacion.aciertos}A / ${mq.evacuacion.errores}E` : (a.mision_evacuacion ? '3A / 0E' : 'Pendiente');

      return [
        a.nombre || 'Sin nombre',
        a.edad ?? 'N/A',
        a.institucion || 'Sin institución',
        a.nivel ?? 1,
        `${obtenerProgreso(a)}%`,
        met.totalAciertos,
        met.totalErrores,
        `${met.efectividad}%`,
        a.mision_diagnostico ? 'Completada' : 'Pendiente',
        diagA,
        a.mision_volcan ? 'Completada' : 'Pendiente',
        volcA,
        a.mision_inundacion ? 'Completada' : 'Pendiente',
        inunA,
        a.mision_sismo ? 'Completada' : 'Pendiente',
        sismA,
        a.mision_evacuacion ? 'Completada' : 'Pendiente',
        evacA,
        formatearFecha(a.created_at),
        formatearFecha(a.ultima_conexion)
      ];
    });

    const csv = [encabezado, ...filas]
      .map((fila) => fila.map((celda) => `"${String(celda).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mision-prevencion-registros-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <main className="admin-dashboard-pro min-h-screen bg-slate-100 p-4 text-slate-950 md:p-6">

      <section className="mx-auto max-w-7xl space-y-6">
        <header className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-2xl md:p-8">
          <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="mb-2 text-xs font-black uppercase tracking-[0.28em] text-cyan-300">Dashboard administrativo</p>
              <h1 className="text-3xl font-black tracking-tight md:text-5xl">Registros de Misión Prevención</h1>
              <p className="mt-3 max-w-2xl font-semibold text-slate-300">
                Revisa estudiantes, progreso, instituciones y datos del plan piloto.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={cargarDatos}
                className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-xs font-black uppercase tracking-widest hover:bg-white/15"
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Actualizar
              </button>
              <button
                onClick={exportarCSV}
                className="flex items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-950 hover:bg-cyan-300"
              >
                <Download size={16} /> {seleccionados.size > 0 ? `Exportar ${seleccionados.size}` : 'Exportar'}
              </button>
            </div>
          </div>
        </header>

        {errorMsg && (
          <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 font-bold text-red-700">
            <ShieldAlert size={20} /> {errorMsg}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={<Users />} label="Participantes" value={stats.total} tone="cyan" />
          <MetricCard icon={<School />} label="Instituciones" value={stats.escuelasActivas} tone="orange" />
          <MetricCard icon={<BarChart3 />} label="Progreso promedio" value={`${stats.progresoPromedio}%`} tone="emerald" />
          <MetricCard icon={<Trophy />} label="Completaron todo" value={stats.completados} tone="purple" />
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-xl md:p-5">
          <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                value={busqueda}
                onChange={(event) => setBusqueda(event.target.value)}
                placeholder="Buscar por nombre o institución..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
              />
            </div>

            <select
              value={escuelaFiltro}
              onChange={(event) => setEscuelaFiltro(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-cyan-500"
            >
              <option value="todas">Todas las instituciones</option>
              {escuelas.map((escuela) => (
                <option key={escuela} value={escuela}>{escuela}</option>
              ))}
            </select>

            <select
              value={estadoFiltro}
              onChange={(event) => setEstadoFiltro(event.target.value as EstadoFiltro)}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 font-bold outline-none focus:border-cyan-500"
            >
              <option value="todos">Todos los estados</option>
              <option value="completos">Completaron</option>
              <option value="pendientes">Pendientes</option>
            </select>
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-4 md:flex-row md:items-center md:justify-between md:p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">Base de datos</p>
              <h2 className="text-xl font-black">Registros encontrados: {agentesFiltrados.length}</h2>
            </div>

            <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-cyan-100 bg-cyan-50/70 p-2">
              <button
                type="button"
                onClick={alternarTodosFiltrados}
                disabled={idsFiltrados.length === 0}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-3 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CheckCircle2 size={15} />
                {todosFiltradosSeleccionados ? 'Quitar todos' : 'Seleccionar todos'}
              </button>

              <span className="rounded-full bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-cyan-800 shadow-sm">
                {seleccionados.size} seleccionados
              </span>

              {seleccionados.size > 0 && (
                <>
                  <button
                    type="button"
                    onClick={limpiarSeleccion}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50"
                  >
                    <X size={14} /> Limpiar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmarEliminacionMasiva(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-3 py-2 text-xs font-black uppercase tracking-wider text-white hover:bg-red-500"
                  >
                    <Trash2 size={14} /> Eliminar seleccionados
                  </button>
                </>
              )}
              <Filter className="ml-auto text-slate-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1040px] text-left">
              <thead className="bg-slate-50 text-xs uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="w-16 px-5 py-4 text-center">
                    <input
                      type="checkbox"
                      checked={todosFiltradosSeleccionados}
                      onChange={alternarTodosFiltrados}
                      disabled={idsFiltrados.length === 0}
                      aria-label="Seleccionar todos los registros visibles"
                      title={todosFiltradosSeleccionados ? 'Quitar selección visible' : 'Seleccionar registros visibles'}
                      className="h-5 w-5 rounded border-2 border-slate-300 accent-cyan-600"
                    />
                    {seleccionadosVisibles > 0 && !todosFiltradosSeleccionados && (
                      <span className="mt-1 block text-[9px] text-cyan-700">{seleccionadosVisibles}</span>
                    )}
                  </th>
                  <th className="px-5 py-4">Estudiante</th>
                  <th className="px-5 py-4">Institución</th>
                  <th className="px-5 py-4">Edad</th>
                  <th className="px-5 py-4">Nivel</th>
                  <th className="px-5 py-4">Progreso</th>
                  <th className="px-5 py-4">Misiones</th>
                  <th className="px-5 py-4">Aciertos / Errores</th>
                  <th className="px-5 py-4">Registro</th>
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-5 py-12 text-center font-black text-slate-500">Cargando registros...</td>
                  </tr>
                ) : agentesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-5 py-12 text-center font-black text-slate-500">No hay registros para mostrar.</td>
                  </tr>
                ) : (
                  agentesFiltrados.map((agente) => {
                    const progreso = obtenerProgreso(agente);
                    const isSelected = seleccionados.has(agente.id);
                    const metricas = obtenerMetricas(agente);

                    return (
                      <tr key={agente.id} className={`transition-colors ${isSelected ? 'bg-cyan-50' : 'hover:bg-slate-50/70'}`}>
                        <td className="px-5 py-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => alternarSeleccion(agente.id)}
                            aria-label={`Seleccionar a ${agente.nombre || 'este estudiante'}`}
                            className="h-5 w-5 rounded border-2 border-slate-300 accent-cyan-600"
                          />
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setAgenteDetalle(agente)}
                            className="text-left group"
                            title="Haz clic para ver la tabulación detallada"
                          >
                            <div className="font-black text-slate-950 group-hover:text-cyan-600 transition flex items-center gap-1.5">
                              {agente.nombre || 'Sin nombre'}
                              <Eye size={13} className="opacity-0 group-hover:opacity-100 text-cyan-600 transition" />
                            </div>
                            <div className="text-xs font-bold text-slate-500">Avatar: {agente.avatar || 'N/A'}</div>
                          </button>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-600">{agente.institucion || 'Sin institución'}</td>
                        <td className="px-5 py-4 font-bold">{agente.edad ?? 'N/A'}</td>
                        <td className="px-5 py-4">
                          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-black text-white">{agente.nivel ?? 1}</span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="h-3 w-36 overflow-hidden rounded-full bg-slate-100">
                            <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-500" style={{ width: `${progreso}%` }} />
                          </div>
                          <div className="mt-1 text-xs font-black text-slate-500">{progreso}%</div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-1.5">
                            <MissionDot active={Boolean(agente.mision_diagnostico)} label="D" />
                            <MissionDot active={Boolean(agente.mision_volcan)} label="V" />
                            <MissionDot active={Boolean(agente.mision_inundacion)} label="I" />
                            <MissionDot active={Boolean(agente.mision_sismo)} label="S" />
                            <MissionDot active={Boolean(agente.mision_evacuacion)} label="E" />
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => setAgenteDetalle(agente)}
                            className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold transition hover:border-violet-300 hover:bg-violet-50"
                            title="Ver tabulación detallada de preguntas y respuestas"
                          >
                            <span className="font-black text-emerald-600">✓ {metricas.totalAciertos}</span>
                            <span className="text-slate-300">/</span>
                            <span className="font-black text-rose-600">✗ {metricas.totalErrores}</span>
                            <Eye size={13} className="text-slate-400 group-hover:text-violet-600 transition" />
                          </button>
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-500">{formatearFecha(agente.created_at)}</td>
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center justify-end gap-2">
                            <button
                              onClick={() => setAgenteDetalle(agente)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-black uppercase tracking-wider text-violet-700 hover:bg-violet-100 transition"
                              title="Ver métricas y tabulación detallada"
                            >
                              <BarChart3 size={14} /> Tabulación
                            </button>
                            <button
                              onClick={() => setRegistroSeleccionado(agente)}
                              className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-black uppercase tracking-wider text-red-700 hover:bg-red-100 transition"
                            >
                              <Trash2 size={14} /> Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-xl md:p-6">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-fuchsia-50 text-fuchsia-700"><MessageCircleHeart size={22} /></div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-fuchsia-600">Buzón de sugerencias</p>
                <h2 className="text-2xl font-black text-slate-950">Últimas opiniones de los agentes</h2>
              </div>
            </div>
            {sugerencias.length > 0 && (
              <button
                onClick={() => setConfirmarEliminarTodasSugerencias(true)}
                className="inline-flex items-center gap-2 self-start rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-red-700 hover:bg-red-100 transition sm:self-auto"
              >
                <Trash2 size={14} /> Borrar todas las sugerencias
              </button>
            )}
          </div>

          {sugerencias.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm font-bold text-slate-500">Todavía no hay sugerencias enviadas.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {sugerencias.map((item) => (
                <div key={item.id} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-amber-500">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} size={14} fill={index < item.calificacion ? 'currentColor' : 'none'} />
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400">{formatearFecha(item.created_at)}</span>
                      <button
                        onClick={() => setSugerenciaSeleccionada(item)}
                        className="rounded-lg p-1 text-slate-400 hover:bg-red-100 hover:text-red-600 transition"
                        title="Eliminar sugerencia"
                        aria-label="Eliminar sugerencia"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-black uppercase tracking-wide text-slate-700">{item.nombre || 'Agente anónimo'} · {item.institucion || 'Sin institución'}</p>
                  {item.comentario && <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">"{item.comentario}"</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </section>

      {registroSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Trash2 size={26} />
            </div>
            <h3 className="text-2xl font-black">Eliminar registro</h3>
            <p className="mt-2 font-semibold text-slate-600">
              ¿Seguro que deseas eliminar a <strong>{registroSeleccionado.nombre || 'este estudiante'}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setRegistroSeleccionado(null)}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={eliminarRegistro}
                disabled={deletingId === registroSeleccionado.id}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 font-black uppercase tracking-wider text-white hover:bg-red-500 disabled:opacity-50"
              >
                {deletingId === registroSeleccionado.id ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {confirmarEliminacionMasiva && seleccionados.size > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Trash2 size={26} />
            </div>
            <h3 className="text-2xl font-black">Eliminar varios registros</h3>
            <p className="mt-2 font-semibold text-slate-600">
              Vas a eliminar <strong>{seleccionados.size} usuarios</strong> al mismo tiempo. Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmarEliminacionMasiva(false)}
                disabled={deletingBulk}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={eliminarSeleccionados}
                disabled={deletingBulk}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 font-black uppercase tracking-wider text-white hover:bg-red-500 disabled:opacity-50"
              >
                {deletingBulk ? 'Eliminando...' : `Eliminar ${seleccionados.size}`}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {sugerenciaSeleccionada && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Trash2 size={26} />
            </div>
            <h3 className="text-2xl font-black">Eliminar sugerencia</h3>
            <p className="mt-2 font-semibold text-slate-600">
              ¿Seguro que deseas eliminar la sugerencia de <strong>{sugerenciaSeleccionada.nombre || 'este agente'}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setSugerenciaSeleccionada(null)}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => eliminarSugerencia(sugerenciaSeleccionada.id)}
                disabled={deletingSugerenciaId === sugerenciaSeleccionada.id}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 font-black uppercase tracking-wider text-white hover:bg-red-500 disabled:opacity-50"
              >
                {deletingSugerenciaId === sugerenciaSeleccionada.id ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {confirmarEliminarTodasSugerencias && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Trash2 size={26} />
            </div>
            <h3 className="text-2xl font-black">Vaciar buzón de sugerencias</h3>
            <p className="mt-2 font-semibold text-slate-600">
              Vas a eliminar <strong>todas las sugerencias ({sugerencias.length})</strong> registradas en la base de datos. Esta acción no se puede deshacer.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmarEliminarTodasSugerencias(false)}
                disabled={deletingAllSugerencias}
                className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={eliminarTodasSugerencias}
                disabled={deletingAllSugerencias}
                className="flex-1 rounded-2xl bg-red-600 px-4 py-3 font-black uppercase tracking-wider text-white hover:bg-red-500 disabled:opacity-50"
              >
                {deletingAllSugerencias ? 'Eliminando...' : 'Borrar todas'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {agenteDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative w-full max-w-4xl rounded-[2.5rem] bg-white p-6 md:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto border-4 border-slate-100"
          >
            {/* Header del Estudiante */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-100 text-3xl shadow-inner">
                  {agenteDetalle.avatar || '🧒'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-slate-950">{agenteDetalle.nombre || 'Estudiante'}</h3>
                    <span className="rounded-full bg-slate-950 px-3 py-0.5 text-xs font-black text-white">
                      Nivel {agenteDetalle.nivel ?? 1}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-slate-500">
                    {agenteDetalle.institucion || 'Sin institución'} · {agenteDetalle.edad ? `${agenteDetalle.edad} años` : 'Edad no registrada'} · Registrado: {formatearFecha(agenteDetalle.created_at)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAgenteDetalle(null)}
                className="rounded-2xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                aria-label="Cerrar modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tarjetas de Métricas Globales */}
            {(() => {
              const met = obtenerMetricas(agenteDetalle);
              return (
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                    <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
                      <CheckCircle2 size={18} /> Aciertos Totales
                    </div>
                    <p className="mt-2 text-3xl font-black text-emerald-950">{met.totalAciertos}</p>
                    <p className="text-xs font-semibold text-emerald-700 mt-0.5">Respuestas correctas logradas</p>
                  </div>

                  <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-4">
                    <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
                      <AlertCircle size={18} /> Errores / Reintentos
                    </div>
                    <p className="mt-2 text-3xl font-black text-rose-950">{met.totalErrores}</p>
                    <p className="text-xs font-semibold text-rose-700 mt-0.5">Intentos fallidos previos</p>
                  </div>

                  <div className="rounded-2xl border border-violet-100 bg-violet-50/70 p-4">
                    <div className="flex items-center gap-2 text-violet-700 font-bold text-xs uppercase tracking-wider">
                      <TrendingUp size={18} /> Precisión / Efectividad
                    </div>
                    <p className="mt-2 text-3xl font-black text-violet-950">{met.efectividad}%</p>
                    <p className="text-xs font-semibold text-violet-700 mt-0.5">Rendimiento global</p>
                  </div>
                </div>
              );
            })()}

            {/* Tabulación por Misión */}
            <div className="mt-8">
              <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500 mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-cyan-600" /> Tabulación detallada por Misión y Pregunta
              </h4>

              <div className="space-y-4">
                {(['diagnostico', 'volcan', 'inundacion', 'sismo', 'evacuacion'] as const).map((key) => {
                  const info = PREGUNTAS_DEFECTO[key];
                  const campoCompletada = `mision_${key}` as keyof Agente;
                  const completada = Boolean(agenteDetalle[campoCompletada]);
                  const mq = agenteDetalle.metricas_quiz?.misiones?.[key];

                  const aciertosMision = mq?.aciertos ?? (completada ? info.preguntas.length : 0);
                  const erroresMision = mq?.errores ?? 0;

                  return (
                    <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-slate-300">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/70 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{info.icono}</span>
                          <div>
                            <h5 className="font-black text-slate-900 text-base">{info.titulo}</h5>
                            <span className="text-xs font-bold text-slate-500">
                              {info.preguntas.length} preguntas en esta misión
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-black uppercase tracking-wider ${completada ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                            {completada ? <><CheckCircle2 size={13} /> Completada</> : '⏳ Pendiente'}
                          </span>
                          <span className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-black text-slate-700">
                            ✓ {aciertosMision} Aciertos | ✗ {erroresMision} Errores
                          </span>
                        </div>
                      </div>

                      {/* Tabla de Preguntas */}
                      <div className="mt-3 overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200/50">
                              <th className="pb-2 w-10">#</th>
                              <th className="pb-2">Pregunta / Concepto Clave</th>
                              <th className="pb-2 text-center w-24">Aciertos</th>
                              <th className="pb-2 text-center w-24">Errores</th>
                              <th className="pb-2 text-right w-28">Estado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                            {info.preguntas.map((enunciadoDefecto, idx) => {
                              const pregData = mq?.preguntas?.[idx];
                              const pAciertos = pregData?.aciertos ?? (completada ? 1 : 0);
                              const pErrores = pregData?.errores ?? 0;
                              const pEnunciado = pregData?.enunciado || enunciadoDefecto;
                              const respondida = pAciertos > 0 || completada;

                              return (
                                <tr key={idx} className="hover:bg-white/80 transition">
                                  <td className="py-2.5 font-black text-slate-400">P{idx + 1}</td>
                                  <td className="py-2.5 pr-3 text-slate-800 font-bold">{pEnunciado}</td>
                                  <td className="py-2.5 text-center">
                                    <span className="inline-flex items-center justify-center rounded-lg bg-emerald-100 px-2 py-0.5 font-black text-emerald-800">
                                      {pAciertos}
                                    </span>
                                  </td>
                                  <td className="py-2.5 text-center">
                                    <span className={`inline-flex items-center justify-center rounded-lg px-2 py-0.5 font-black ${pErrores > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-500'}`}>
                                      {pErrores}
                                    </span>
                                  </td>
                                  <td className="py-2.5 text-right">
                                    {respondida ? (
                                      <span className="font-bold text-emerald-600">Aprobada ✓</span>
                                    ) : (
                                      <span className="font-bold text-slate-400">Sin responder</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setAgenteDetalle(null)}
                className="rounded-2xl bg-slate-950 px-6 py-3 font-black uppercase tracking-wider text-white hover:bg-slate-800 transition"
              >
                Cerrar Detalle
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
};

const PREGUNTAS_DEFECTO: Record<string, { titulo: string; icono: string; preguntas: string[] }> = {
  diagnostico: {
    titulo: 'Diagnóstico Inicial',
    icono: '📋',
    preguntas: [
      '¿Qué significa "Amenaza" en Gestión de Riesgos?',
      '¿Qué significa ser "Vulnerable" ante un desastre?',
      'Suma de Amenaza y Vulnerabilidad = Riesgo',
      '¿A qué llamamos verdaderamente un "Desastre"?',
      '¿Qué es la "Prevención" de riesgos?',
      '¿Qué significa que una comunidad sea "Resiliente"?',
      '¿Para qué sirve un Sistema de Alerta Temprana (SAT)?',
      'Diferencia entre Urgencia y Emergencia',
      '¿Cómo se define una "Zona Segura"?',
      'Tener una buena Percepción del Riesgo'
    ]
  },
  volcan: {
    titulo: 'Misión 1: Alerta Volcánica',
    icono: '🌋',
    preguntas: [
      'Protección de vías respiratorias frente a la ceniza (Mascarilla)',
      'Cuidado y cobertura de depósitos de agua en casa',
      'Protección de los ojos frente a la caída de ceniza (Gafas de protección)'
    ]
  },
  inundacion: {
    titulo: 'Misión 2: Inundaciones',
    icono: '🌊',
    preguntas: [
      'Desconexión inmediata de energía eléctrica',
      'Evacuación hacia zonas altas y seguras',
      'Mochila de Emergencia: 4 elementos indispensables'
    ]
  },
  sismo: {
    titulo: 'Misión 3: Sismos y Terremotos',
    icono: '📳',
    preguntas: [
      'Acción inmediata durante el temblor (Agacharse y cubrirse)',
      'Zona más segura de resguardo (Bajo una mesa resistente)',
      'Revisión posterior prioritaria (Heridos y daños)'
    ]
  },
  evacuacion: {
    titulo: 'Misión 4: Evacuación y Plan Familiar',
    icono: '🧭',
    preguntas: [
      'Herramienta vital de orientación (Seguir la señalética)',
      'Punto de encuentro seguro familiar',
      'Acción solidaria y segura (Ayudar a los demás)'
    ]
  }
};

const MetricCard = ({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string | number; tone: string }) => {
  const tones: Record<string, string> = {
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-100',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100'
  };

  return (
    <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-lg">
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border ${tones[tone] || tones.cyan}`}>
        {icon}
      </div>
      <p className="text-xs font-black uppercase tracking-[0.22em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black text-slate-950">{value}</p>
    </div>
  );
};

const MissionDot = ({ active, label }: { active: boolean; label: string }) => (
  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
    {active ? <CheckCircle2 size={15} /> : label}
  </span>
);

const obtenerProgreso = (agente: Agente) => {
  const completadas = [agente.mision_diagnostico, agente.mision_volcan, agente.mision_inundacion, agente.mision_sismo, agente.mision_evacuacion].filter(Boolean).length;
  return Math.round((completadas / 5) * 100);
};

const obtenerMetricas = (agente: Agente): { totalAciertos: number; totalErrores: number; efectividad: number } => {
  if (agente.metricas_quiz && typeof agente.metricas_quiz === 'object') {
    const mq = agente.metricas_quiz;
    const totalA = mq.total_aciertos || 0;
    const totalE = mq.total_errores || 0;
    const totalResp = totalA + totalE;
    const efectividad = totalResp > 0 ? Math.round((totalA / totalResp) * 100) : (totalA > 0 ? 100 : 0);
    return { totalAciertos: totalA, totalErrores: totalE, efectividad };
  }

  let aciertos = 0;
  if (agente.mision_diagnostico) aciertos += 10;
  if (agente.mision_volcan) aciertos += 3;
  if (agente.mision_inundacion) aciertos += 3;
  if (agente.mision_sismo) aciertos += 3;
  if (agente.mision_evacuacion) aciertos += 3;
  return { totalAciertos: aciertos, totalErrores: 0, efectividad: aciertos > 0 ? 100 : 0 };
};

const formatearFecha = (value: string | null) => {
  if (!value) return 'Sin fecha';
  return new Date(value).toLocaleDateString('es-EC', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const normalizar = (value: string) => {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

export default AdminPanel;
