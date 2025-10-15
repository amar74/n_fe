import React from 'react';
import { AccountStatsCard } from '../../AccountDetailsPage.types';

type AccountStatsCardsProps = {
  stats: AccountStatsCard[];
}

export function AccountStatsCards({ stats }: AccountStatsCardsProps) {
  // Split stats into two columns (2x2 grid)
  const leftStats = stats.slice(0, 2); // Total Value and Opportunities
  const rightStats = stats.slice(2, 4); // Last Contact and Client Type

  return (
    <div className="w-full h-60 p-6 bg-white rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#E5E7EB] flex justify-between items-start">
      <div className="flex-1 self-stretch flex justify-start items-start gap-3">
        
        <div className="flex-1 h-44 inline-flex flex-col justify-start items-start gap-3">
          {leftStats.map((stat) => (
            <div
              key={stat.id}
              className="self-stretch flex-1 px-3 py-2 bg-[#FAFAF8] rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#E5E7EB] inline-flex justify-between items-center"
            >
              
              <div className="size-14 p-3 bg-[#F0F0F0] rounded-xl flex justify-between items-center overflow-hidden">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {stat.id === 'total-value' ? (
                    <path d="M2 22C2 17.5817 5.58172 14 10 14C14.4183 14 18 17.5817 18 22H16C16 18.6863 13.3137 16 10 16C6.68629 16 4 18.6863 4 22H2ZM10 13C6.685 13 4 10.315 4 7C4 3.685 6.685 1 10 1C13.315 1 16 3.685 16 7C16 10.315 13.315 13 10 13ZM10 11C12.21 11 14 9.21 14 7C14 4.79 12.21 3 10 3C7.79 3 6 4.79 6 7C6 9.21 7.79 11 10 11ZM18.2837 14.7028C21.0644 15.9561 23 18.752 23 22H21C21 19.564 19.5483 17.4671 17.4628 16.5271L18.2837 14.7028ZM17.5962 3.41321C19.5944 4.23703 21 6.20361 21 8.5C21 11.3702 18.8042 13.7252 16 13.9776V11.9646C17.6967 11.7222 19 10.264 19 8.5C19 7.11935 18.2016 5.92603 17.041 5.35635L17.5962 3.41321Z" fill="#1D2939"/>
                  ) : (
                    <path d="M16.5 3C19.5376 3 22 5.5 22 9C22 16 14.5 20 12 21.5C10.0226 20.3135 4.91699 17.563 2.86894 13.001L1 13V11L2.21045 11.0009C2.07425 10.3633 2 9.69651 2 9C2 5.5 4.5 3 7.5 3C9.35997 3 11 4 12 5C13 4 14.64 3 16.5 3ZM16.5 5C15.4241 5 14.2593 5.56911 13.4142 6.41421L12 7.82843L10.5858 6.41421C9.74068 5.56911 8.5759 5 7.5 5C5.55906 5 4 6.6565 4 9C4 9.68542 4.09035 10.3516 4.26658 11.0004L6.43381 11L8.5 7.55635L11.5 12.5563L12.4338 11H17V13H13.5662L11.5 16.4437L8.5 11.4437L7.56619 13L5.10789 13.0006C5.89727 14.3737 7.09304 15.6681 8.64514 16.9029C9.39001 17.4955 10.1845 18.0485 11.0661 18.6038C11.3646 18.7919 11.6611 18.9729 12 19.1752C12.3389 18.9729 12.6354 18.7919 12.9339 18.6038C13.8155 18.0485 14.61 17.4955 15.3549 16.9029C18.3337 14.533 20 11.9435 20 9C20 6.64076 18.463 5 16.5 5Z" fill="#1D2939"/>
                  )}
                </svg>
              </div>

              
              <div className="inline-flex flex-col justify-center items-end gap-3.5">
                <div className="justify-start text-[#667085] text-sm font-normal font-['Outfit'] leading-tight">
                  {stat.title}
                </div>
                <div className="justify-start text-slate-800 text-xl font-medium font-['Outfit'] leading-loose">
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>

        
        <div className="flex-1 h-44 inline-flex flex-col justify-start items-start gap-3">
          {rightStats.map((stat) => (
            <div
              key={stat.id}
              className="self-stretch flex-1 px-3 py-2 bg-[#FAFAF8] rounded-2xl outline outline-1 outline-offset-[-1px] outline-[#E5E7EB] inline-flex justify-between items-center"
            >
              
              <div className="size-14 p-3 bg-[#F0F0F0] rounded-xl flex justify-between items-center overflow-hidden">
                <svg width="25" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {stat.id === 'last-contact' ? (
                    <path d="M2.5 22C2.5 17.5817 6.08172 14 10.5 14C14.9183 14 18.5 17.5817 18.5 22H16.5C16.5 18.6863 13.8137 16 10.5 16C7.18629 16 4.5 18.6863 4.5 22H2.5ZM10.5 13C7.185 13 4.5 10.315 4.5 7C4.5 3.685 7.185 1 10.5 1C13.815 1 16.5 3.685 16.5 7C16.5 10.315 13.815 13 10.5 13ZM10.5 11C12.71 11 14.5 9.21 14.5 7C14.5 4.79 12.71 3 10.5 3C8.29 3 6.5 4.79 6.5 7C6.5 9.21 8.29 11 10.5 11ZM18.7837 14.7028C21.5644 15.9561 23.5 18.752 23.5 22H21.5C21.5 19.564 20.0483 17.4671 17.9628 16.5271L18.7837 14.7028ZM18.0962 3.41321C20.0944 4.23703 21.5 6.20361 21.5 8.5C21.5 11.3702 19.3042 13.7252 16.5 13.9776V11.9646C18.1967 11.7222 19.5 10.264 19.5 8.5C19.5 7.11935 18.7016 5.92603 17.541 5.35635L18.0962 3.41321Z" fill="#1D2939"/>
                  ) : (
                    <path d="M17 3C20.0376 3 22.5 5.5 22.5 9C22.5 16 15 20 12.5 21.5C10.5226 20.3135 5.41699 17.563 3.36894 13.001L1.5 13V11L2.71045 11.0009C2.57425 10.3633 2.5 9.69651 2.5 9C2.5 5.5 5 3 8 3C9.85997 3 11.5 4 12.5 5C13.5 4 15.14 3 17 3ZM17 5C15.9241 5 14.7593 5.56911 13.9142 6.41421L12.5 7.82843L11.0858 6.41421C10.2407 5.56911 9.0759 5 8 5C6.05906 5 4.5 6.6565 4.5 9C4.5 9.68542 4.59035 10.3516 4.76658 11.0004L6.93381 11L9 7.55635L12 12.5563L12.9338 11H17.5V13H14.0662L12 16.4437L9 11.4437L8.06619 13L5.60789 13.0006C6.39727 14.3737 7.59304 15.6681 9.14514 16.9029C9.89001 17.4955 10.6845 18.0485 11.5661 18.6038C11.8646 18.7919 12.1611 18.9729 12.5 19.1752C12.8389 18.9729 13.1354 18.7919 13.4339 18.6038C14.3155 18.0485 15.11 17.4955 15.8549 16.9029C18.8337 14.533 20.5 11.9435 20.5 9C20.5 6.64076 18.963 5 17 5Z" fill="#1D2939"/>
                  )}
                </svg>
              </div>

              
              <div className="inline-flex flex-col justify-center items-end gap-3.5">
                <div className="justify-start text-[#667085] text-sm font-normal font-['Outfit'] leading-tight">
                  {stat.title}
                </div>
                <div className="justify-start text-slate-800 text-xl font-medium font-['Outfit'] leading-loose">
                  {stat.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
