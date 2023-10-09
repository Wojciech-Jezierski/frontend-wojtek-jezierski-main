import { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import { useNavigate } from 'react-router-dom';
import type { InferType } from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { AiOutlineCalendar } from 'react-icons/ai';

import { getCandidates } from '../../services/CandidatesService';
import type { Candidate } from '../../types/candidate';
import type { Job } from '../../types/job';
import { getJobs } from '../../services/JobService';
import { addMeetingSchema } from '../../config/schemas';
import { routerPaths } from '../../config/router';

import 'react-datepicker/dist/react-datepicker.css';

export const AddMeeting = ({
  openAddMeetingWindow,
}: {
  openAddMeetingWindow: () => void;
}) => {
  const { meetings } = routerPaths;
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Provide a type for selectedDate
  const [meetingType, setMeetingType] = useState('Online');

  const [message, setMessage] = useState('');
  // State to control the visibility of the "Place of meeting" label and input
  const [showPlaceOfMeeting, setShowPlaceOfMeeting] = useState(false);
  const [placeOfMeeting, setPlaceOfMeeting] = useState('');
  const [linkOfMeeting, setLinkOfMeeting] = useState(
    'https://google.meets.com',
  );
  const [candidateOptions, setCandidateOptions] = useState<Candidate[]>([]);
  const [jobOptions, setJobOptions] = useState<Job[]>([]);

  const navigate = useNavigate();

  const onRedirect = () => {
    navigate(`${meetings.url}`);
  };

  const token =
    localStorage.getItem('USER_TOKEN') || sessionStorage.getItem('USER_TOKEN');
  const auth = `Bearer ${token}`;
  useEffect(() => {
    const getData = async () => {
      if (!token) {
        return;
      }

      try {
        const fetchedCandidates = await getCandidates(auth);
        const fetchedJobs = await getJobs(auth);
        setCandidateOptions(fetchedCandidates);
        setJobOptions(fetchedJobs);
      } catch {
        setMessage('Data do not fetched properly.');
      }
    };

    getData();
  }, [token, auth]);

  type User = InferType<typeof addMeetingSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<User>({
    resolver: yupResolver(addMeetingSchema),
  });

  function onSubmit(values: Object) {
    return axios
      .post(`${process.env.REACT_APP_API_URL}/meetings`, values, {
        headers: { Authorization: auth },
      })
      .then(() => {
        onRedirect();
      })
      .catch(() => {
        setMessage('Something went wrong. Try again later.');
      });
  }

  const handleDateChange = (date: Date | null) => {
    // Provide a type for the date parameter
    setSelectedDate(date);
  };

  const handleMeetingTypeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const selectedMeetingType = event.target.value;
    setMeetingType(selectedMeetingType);

    // Show/hide the "Place of meeting" based on the selected meeting type
    setShowPlaceOfMeeting(selectedMeetingType === 'Offline');
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content w-[520px] h-[500px]">
        <h1 className="mt-5 text-center font-bold text-xl">Add Meeting</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mt-10">
            <label htmlFor="datePick">
              Date of meeting:{' '}
              <DatePicker
                selected={selectedDate}
                {...register('date')}
                onChange={handleDateChange}
                dateFormat="MM/dd/yyyy"
                placeholderText="Select a date"
                className="ml-1 border border-gray-400"
              />
              <AiOutlineCalendar className="absolute top-[110px] right-[200px] text-xl" />
            </label>
            <span className="text-md text-red-500">
              {errors?.date?.message}
            </span>
            <div className="mt-4">
              <label htmlFor="typeOfMeeting">
                Type of meeting:{' '}
                <select
                  id="typeOfMeeting"
                  value={meetingType}
                  {...register('type')}
                  onChange={handleMeetingTypeChange}
                  className="border border-gray-400"
                >
                  <option>Online</option>
                  <option>Offline</option>
                </select>
              </label>
              <span className="text-md text-red-500">
                {errors?.type?.message}
              </span>
            </div>
            <div className="mt-4">
              {showPlaceOfMeeting ? (
                <label htmlFor="placeOfMeeting">
                  Place of meeting:{' '}
                  <input
                    type="text"
                    id="placeOfMeeting"
                    value={placeOfMeeting}
                    placeholder="Address of place..."
                    {...register('place')}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPlaceOfMeeting(e.target.value)
                    }
                    className="border border-gray-400"
                  />
                </label>
              ) : (
                <label htmlFor="placeOfMeeting">
                  Link to meeting:{' '}
                  <input
                    type="text"
                    id="placeOfMeeting"
                    value={linkOfMeeting}
                    {...register('place')}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setLinkOfMeeting(e.target.value)
                    }
                    className="border border-gray-400"
                  />
                </label>
              )}
              <span className="text-md text-red-500">
                {errors?.place?.message}
              </span>
            </div>
            <div className="mt-4">
              <label htmlFor="candidate">
                Candidate:{' '}
                <select
                  {...register('candidateId')}
                  id="candidate"
                  className="border border-gray-400"
                >
                  {candidateOptions.map((candidate) => (
                    <option key={candidate.id} value={candidate.id}>
                      {candidate.name}
                    </option>
                  ))}
                </select>
              </label>
              <span className="text-md text-red-500">
                {errors?.candidateId?.message}
              </span>
            </div>
            <div className="mt-4">
              <label htmlFor="job">
                Job:{' '}
                <select
                  {...register('JobId')}
                  id="job"
                  className="border border-gray-400"
                >
                  {jobOptions.map((job) => (
                    <option key={job.id.toString()} value={job.id.toString()}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </label>
              <span className="text-md text-red-500">
                {errors?.JobId?.message}
              </span>
            </div>
          </div>
          <div className="flex mt-16 justify-center space-x-12 text-xl font-bold">
            <button type="submit" className="bg-red-200 p-4 rounded-xl">
              Add
            </button>
            <button onClick={openAddMeetingWindow}>Cancel</button>
          </div>
          <div className="mt-3 text-xl text-red-500 text-center">{message}</div>
        </form>
      </div>
    </div>
  );
};
