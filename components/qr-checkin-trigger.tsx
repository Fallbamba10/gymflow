"use client";

import { useRef, useTransition } from "react";
import { QrScanner } from "@/components/qr-scanner";
import { performMemberCheckin } from "@/app/(app)/checkin/actions";

export function QrCheckinTrigger() {
  const formRef = useRef<HTMLFormElement>(null);
  const memberIdRef = useRef<HTMLInputElement>(null);
  const [, startTransition] = useTransition();

  function handleScan(memberId: string) {
    if (!formRef.current || !memberIdRef.current) return;
    memberIdRef.current.value = memberId;
    startTransition(() => {
      formRef.current?.requestSubmit();
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <QrScanner onScan={handleScan} />
      <form ref={formRef} action={performMemberCheckin} className="hidden">
        <input ref={memberIdRef} type="hidden" name="member_id" value="" />
        <input type="hidden" name="current_q" value="" />
      </form>
    </div>
  );
}
