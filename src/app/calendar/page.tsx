"use client";
import {Calendar} from "@/components/Calendar";

export default function DemoWrapper() {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const onClickHandler = (_day: number, _month: number, _year: number) => {
    const month = monthNames[_month];
    const formattedDate = `${month} ${_day}, ${_year}`;
    alert(`Selected date: ${formattedDate}`);
  };

  return (
    <div className="relative flex h-screen max-h-screen w-full flex-col gap-4 px-4 pt-4 items-center justify-center">
      <div className="relative h-full overflow-auto mt-20">
        <Calendar onClick={onClickHandler} />
      </div>
    </div>
  );
}