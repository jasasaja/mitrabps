import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // 1. Otorisasi Pengirim Webhook menggunakan X-CALLBACK-TOKEN
    const incomingToken = req.headers.get("x-callback-token");
    const XENDIT_CALLBACK_TOKEN = process.env.XENDIT_CALLBACK_TOKEN || "DEFAULT_JASASAJA_XENDIT_TOKEN_2025";

    if (!incomingToken || incomingToken !== XENDIT_CALLBACK_TOKEN) {
      return NextResponse.json(
        { error: "Skeptis: Token webhook tidak valid atau tidak diizinkan." },
        { status: 401 }
      );
    }

    // 2. Ekstraksi Body Mentah sebagai Teks biasa guna mencegah malformasi JSON
    const rawBody = await req.text();
    if (!rawBody || rawBody.trim() === "") {
      return NextResponse.json(
        { error: "Unprocessable Entity: Payload kosong." },
        { status: 422 }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Format request tidak didukung: Gagal mengurai JSON." },
        { status: 400 }
      );
    }

    // Standard payment parameters
    const eventId = payload.id || payload.data?.id || payload.data?.payment_id;
    const eventType = payload.event || "payment.capture";
    const tenantId = payload.data?.reference_id || payload.reference_id; // Simpan ID Tenant JASASAJA di kolom reference_id Xendit
    const status = payload.status || payload.data?.status;

    if (!eventId || !tenantId) {
      return NextResponse.json(
        { error: "Unprocessable Entity: Metadata identitas transaksi tidak lengkap." },
        { status: 422 }
      );
    }

    // Mematikan eksekusi jika status transaksi dari Xendit bukan bernilai kesuksesan
    const isSucceeded = ["SUCCEEDED", "COMPLETED", "SUCCESS", "PAID"].includes(status?.toUpperCase());
    if (!isSucceeded) {
      return NextResponse.json(
        { status: "ignored", message: `Transaksi diabaikan karena status belum lunas (${status}).` },
        { status: 200 }
      );
    }

    // --- TRANSASKI DATABASE & PESSIMISTIC LOCKING SIMULATOR ---
    const logsDbOperations: string[] = [];
    logsDbOperations.push("DATABASE_TRANSACTION: BEGIN");
    
    // 3. Pengecekan Idempotensi yang Aman Menggunakan Penguncian Pesimistis (FOR UPDATE)
    logsDbOperations.push(`SQL_EXECUTION: SELECT 1 FROM processed_webhooks WHERE event_id = '${eventId}' AND provider = 'XENDIT' FOR UPDATE`);
    
    // Simulate double webhook transmission check
    const isDuplicate = false; // We can let client pass duplicate headers to test this
    if (isDuplicate) {
      logsDbOperations.push("DATABASE_TRANSACTION: ROLLBACK (Duplicate detected)");
      return NextResponse.json(
        { status: "deduplicated", message: "Transaksi telah berhasil diproses sebelumnya." },
        { status: 200 }
      );
    }

    // 4. Perubahan Status Tier Tenant dari FREE Menjadi PRO Secara Instan
    logsDbOperations.push(`SQL_EXECUTION: UPDATE tenants SET tier = 'PRO', updated_at = NOW() WHERE id = '${tenantId}' RETURNING id, name`);
    
    // 5. Catat riwayat log webhook baru untuk memblokir eksekusi ulang di masa depan
    logsDbOperations.push(`SQL_EXECUTION: INSERT INTO processed_webhooks (event_id, provider, event_type, tenant_id) VALUES ('${eventId}', 'XENDIT', '${eventType}', '${tenantId}')`);
    
    logsDbOperations.push("DATABASE_TRANSACTION: COMMIT");

    // 6. Penghapusan Instan Sesi Pembatasan Kuota Lama pada Upstash Redis
    const freeCacheKey = `@upstash/ratelimit:free:tenant:${tenantId}`;
    const proCacheKey = `@upstash/ratelimit:pro:tenant:${tenantId}`;
    
    const logsRedisOperations = [
      `REDIS_COMMAND: DEL ${freeCacheKey}`,
      `REDIS_COMMAND: DEL ${proCacheKey}`,
      `STATUS: Cache invalidated, tenant upgraded to PRO (500 audits/24h active immediately)`
    ];

    // Return transactional trace back to the simulator tool so they can inspect execution
    return NextResponse.json({
      status: "success",
      message: `Tenant [ID: ${tenantId.slice(0,8)}...] telah berhasil di-upgrade ke PRO. Cache dibersihkan secara asinkron.`,
      transaction_logs: {
        database: logsDbOperations,
        redis: logsRedisOperations
      },
      upgraded_tenant: {
        id: tenantId,
        tier: "PRO",
        new_limit: 500,
        provider: "XENDIT",
        event_id: eventId
      }
    });

  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
