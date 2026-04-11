interface GreetingSectionProps {
  dateLabel?: string;
  greeting?: string;
  name?: string;
}

export function GreetingSection({
  dateLabel = "Monday, 23 March",
  greeting = "Good morning,",
  name = "Amara",
}: GreetingSectionProps) {
  return (
    <>
      <div className="mt-2 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-[#6366F1]"></span>
        <span className="text-[12px] font-medium text-[#6B7280]">{dateLabel}</span>
      </div>

      <div>
        <p className="mb-1 text-[14px] text-[#6B7280]">{greeting}</p>
        <h1 className="mb-3 text-[32px] font-semibold leading-tight text-[#121417]">
          {name}
          <span className="ml-2 inline-block h-2.5 w-2.5 align-text-top rounded-full bg-[#6366F1]"></span>
        </h1>
      </div>
    </>
  );
}

export default GreetingSection;
