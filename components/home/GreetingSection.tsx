interface GreetingSectionProps {
  dateLabel?: string;
  greeting?: string;
  name?: string;
}

export function GreetingSection({
  dateLabel = "Monday, 23 March",
  greeting = "Good morning,",
  name = "Kevin",
}: GreetingSectionProps) {
  return (
    <div className="min-w-0">
      <p className="text-[12px] font-medium text-[#6B7280]">{dateLabel}</p>
      <div className="mt-1.5">
        <p className="text-[14px] leading-none text-[#6B7280]">{greeting}</p>
        <h1 className="mt-1 text-[31px] font-semibold leading-none tracking-[-0.045em] text-[#121417] sm:text-[34px]">
          {name}
        </h1>
      </div>
    </div>
  );
}

export default GreetingSection;
