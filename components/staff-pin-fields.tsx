import { FormField } from "@/components/form-field";
import type { GymStaffRecord } from "@/lib/supabase/queries";

type StaffPinFieldsProps = {
  staff: GymStaffRecord[];
};

export function StaffPinFields({ staff }: StaffPinFieldsProps) {
  const activeStaff = staff.filter((member) => member.active);

  if (activeStaff.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <FormField label="Employe">
        <select
          name="staff_id"
          className="h-10 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none focus:border-mint"
          defaultValue=""
        >
          <option value="">Compte connecte</option>
          {activeStaff.map((member) => (
            <option key={member.id} value={member.id}>
              {member.full_name}
            </option>
          ))}
        </select>
      </FormField>
      <FormField label="PIN">
        <input
          name="staff_pin"
          inputMode="numeric"
          pattern="[0-9]{4,8}"
          className="h-10 w-full rounded-md border border-line bg-paper px-3 text-sm outline-none focus:border-mint"
          placeholder="PIN"
        />
      </FormField>
    </div>
  );
}
