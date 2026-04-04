'use client';

import { useState, useTransition } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

function AcceptModal({
  onConfirm,
  onCancel,
  isPending,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-2xl p-6 shadow-2xl max-w-sm w-full">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-white text-base">
            Aceptar presupuesto
          </h3>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
          Al confirmar, estás aceptando los servicios, costos y condiciones descritos en este presupuesto. Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-navy-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-navy-800 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors disabled:opacity-60"
          >
            {isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export function AcceptButton({ cotizacionId }: { cotizacionId: string }) {
  const [showModal, setShowModal] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      try {
        const res = await fetch(`/api/q/${cotizacionId}/accept`, { method: 'POST' });
        const data = await res.json();
        if (data.ok) {
          setAccepted(true);
          setShowModal(false);
        } else {
          setError(data.error ?? 'Error al aceptar');
          setShowModal(false);
        }
      } catch {
        setError('Error al aceptar');
        setShowModal(false);
      }
    });
  };

  if (accepted) {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-3 py-1.5 font-medium">
        <CheckCircle size={15} /> ¡Presupuesto aceptado!
      </span>
    );
  }

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={() => setShowModal(true)}
          disabled={isPending}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white rounded-xl px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-60 shadow-sm"
        >
          <CheckCircle size={15} />
          Aceptar presupuesto
        </button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>

      {showModal && (
        <AcceptModal
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
          isPending={isPending}
        />
      )}
    </>
  );
}
