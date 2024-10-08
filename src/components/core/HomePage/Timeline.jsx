import React from 'react'
import Logo1 from "../../../assets/TimeLineLogo/Logo1.svg"
import Logo2 from "../../../assets/TimeLineLogo/Logo2.svg"
import Logo3 from "../../../assets/TimeLineLogo/Logo3.svg"
import Logo4 from "../../../assets/TimeLineLogo/Logo4.svg"
import timeLineImg from "../../../assets/Images/TimelineImage.png"

const timeline = [
    {
        Logo : Logo1,
        heading:"Leadership",
        Description:"Fully committed to the success company"
    },
    {
        Logo : Logo2,
        heading:"Responsibility",
        Description:"Students will always be our top priority"
    },
    {
        Logo : Logo3,
        heading:"Flexibility",
        Description:"The ability to switch is an important skills"
    },
    {
        Logo : Logo4,
        heading:"Solve the Problem",
        Description:"Code the way to a solution"
    }
]

const TimelineSection = () => {
  return (
    <div>
        <div className='flex flex-row gap-10 items-center'>
            <div className='flex flex-col w-[45%] gap-5'>
                {
                    timeline.map((ele,index)=>(
                        <div className='flex flex-row gap-6' key={index}>
                        <div className="w-[52px] h-[52px] bg-white rounded-full flex justify-center items-center shadow-[#00000012] shadow-[0_0_62px_0]">
                                <img src={ele.Logo} alt=""/>
                            </div>
                            
                            <div className='flex flex-col'>
                                <h2 className='font-semibold text-[18px]'>{ele.heading}</h2>
                                <p className='text-base'>{ele.Description}</p>
                            </div>
                        </div>
                    )) 
                }
            </div>
            <div className='relative shadow-blue-200'>
                <img src={timeLineImg} 
                alt="timelineimage"
                className='shadow-white object-cover h-fit'
                />
                <div className='absolute bg-caribbeangreen-700 flex flex-row text-white uppercase py-7 left-[50%] translate-x-[-50%] translate-y-[-50%]'>
                    <div className='flex flex-row gap-5 items-center border-r border-caribbeangreen-300 px-7'>
                        <p className='text-3xl font-bold'>10</p>
                        <p className='text-caribbeangreen-300'>Years of Experience</p>
                    </div>

                    <div className='flex gap-5 items-center px-7'>
                        <p className='text-3xl font-bold'>250</p>
                        <p className='text-caribbeangreen-300'>Type of Courses</p>
                    </div>

                </div>
            </div>
        </div>
    </div>
  )
}

export default TimelineSection
