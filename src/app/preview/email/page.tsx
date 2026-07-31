import { formatActivityLabel } from "@/lib/activities";

export default function EmailPreviewPage() {
  const subject = "Camille wants to woo you 💌";
  const plan = formatActivityLabel("dinner");

  return (
    <div className="min-h-screen bg-[#1a1a1c] px-4 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/40">
          Aperçu email · invitation reçue
        </p>
        <h1 className="font-serif text-2xl italic text-white/90">
          Ce que voit le destinataire dans sa boîte mail
        </h1>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-[#2a2a2e] shadow-2xl">
          {/* Inbox header */}
          <div className="border-b border-white/10 px-5 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#E85D75] font-serif italic text-lg">
                W
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate font-medium text-white">
                    Woo{" "}
                    <span className="font-normal text-white/40">
                      &lt;onboarding@resend.dev&gt;
                    </span>
                  </p>
                  <span className="shrink-0 text-xs text-white/35">now</span>
                </div>
                <p className="mt-0.5 truncate text-sm text-white/90">{subject}</p>
                <p className="mt-0.5 truncate text-xs text-white/40">
                  To: alex@email.com
                </p>
              </div>
            </div>
          </div>

          {/* Exact email body (same styles as Resend template) */}
          <div
            className="px-4 py-10 sm:px-8"
            style={{
              background:
                "linear-gradient(135deg, #EAE0F8 0%, #F7EAE2 55%, #FCEFD9 100%)",
            }}
          >
            <div
              className="mx-auto max-w-[520px] rounded-3xl bg-white px-8 py-10 text-center shadow-[0_20px_40px_rgba(0,0,0,0.08)]"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              <p
                className="m-0 mb-2 italic"
                style={{ fontSize: 28, color: "#3D1F2B" }}
              >
                Woo
              </p>
              <p
                className="m-0 mb-7 uppercase"
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 12,
                  letterSpacing: "0.2em",
                  color: "#8A7A85",
                }}
              >
                To woo.
              </p>

              <h2
                className="m-0 mb-3 font-bold"
                style={{ fontSize: 28, color: "#3D1F2B" }}
              >
                You&apos;ve been Woo&apos;d
              </h2>

              <p
                className="m-0 mb-4 leading-relaxed"
                style={{
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 16,
                  color: "#3D1F2B",
                }}
              >
                <strong>Camille</strong> wants to woo you on{" "}
                <strong>2026-08-14</strong> at <strong>19:30</strong> — {plan}.
              </p>

              <p
                className="m-0 mb-2 rounded-2xl px-4 py-4 italic"
                style={{
                  background: "#F7DCE3",
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 15,
                  color: "#3D1F2B",
                }}
              >
                “Been thinking about this all week… just say yes.”
              </p>

              <span
                className="mt-6 inline-block rounded-2xl px-7 py-3.5 font-medium text-white"
                style={{
                  background: "#E85D75",
                  fontFamily: "system-ui, sans-serif",
                  fontSize: 15,
                }}
              >
                Open your Woo 💌
              </span>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-white/40">
          Objet : <span className="text-white/70">{subject}</span>
          <br />
          Le bouton ouvre <code className="text-white/60">/w/[id]</code> — la
          page publique romantique.
        </p>
      </div>
    </div>
  );
}
