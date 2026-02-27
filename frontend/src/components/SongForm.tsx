'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

type Inputs = {
  title: string;
  melody: string;
  author: string;
  lyrics: string;
};

const pattern = /^[a-zA-ZæøåÆØÅ0-9\s.\-/:;,'*!?()"…–]+$/;

export default function SongForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<Inputs>({ mode: 'onChange' });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const lyricsValue = watch('lyrics') || '';

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log('Success in submitting form');
    console.log(data);

    reset();
    // try {
    // setIsSubmitting(true);
    //   const res = await fetch('/api/songs', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data),
    //   });
    //   if (res.ok) alert('Sang lagt til');
    //   else alert('Kunne ikke legge til sang');
    // if(!res.ok) {
    // const errorData = await res.json();
    // throw new Error(errorData.message || 'Serverfeil');
    //}
    // } catch (err) {
    //   console.error(err);
    //   alert('Feil i å legge til sang');
    // } finally {
    //     setIsSubmitting(false)
    // }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col m-8 gap-1 bg-[#FFFDFB] max-w-2xl md:mx-auto"
    >
      <h1 className="text-black text-xl mb-2">Legg til sang</h1>
      <span>
        <label className="text-black">Tittel*</label>
        {errors.title && (
          <span className="text-red-500 italic ml-2">{errors.title.message}</span>
        )}{' '}
      </span>
      <input
        {...register('title', {
          required: 'Du må skrive inn tittel',
          maxLength: {
            value: 40,
            message: 'Tittel kan maks være 40 tegn',
          },
          pattern: {
            value: pattern,
            message: 'Tittelen inneholder ugyldige tegn',
          },
        })}
        className="bg-[#FFFDFB] mb-5 p-1 outline outline-[#E6E4E2] rounded-sm text-black"
      ></input>

      <label className="text-black">Av</label>
      <input
        {...register('author', {
          maxLength: 40,
          pattern,
        })}
        className="bg-[#FFFDFB] mb-5 p-1 outline outline-[#E6E4E2]  rounded-sm  text-black"
      />

      <label className="text-black">Melodi</label>
      <input
        {...register('melody', {
          maxLength: 40,
          pattern,
        })}
        className="bg-[#FFFDFB] mb-5 p-1 outline outline-[#E6E4E2] rounded-sm  text-black"
      ></input>
      <span>
        <label className="text-black">Sangtekst*</label>
        {errors.lyrics && <span className="text-red-500 italic ml-2">{errors.lyrics.message}</span>}
      </span>
      <textarea
        {...register('lyrics', {
          required: 'Du må skrive inn sangtekst',
          minLength: {
            value: 20,
            message: 'Sangteksten må være minst 20 tegn',
          },
          maxLength: {
            value: 3000,
            message: 'Sangteksten kan maks være 3000 tegn',
          },
          pattern: {
            value: pattern,
            message: 'Sangteksten inneholder ugyldige tegn',
          },
        })}
        className="bg-[#FFFDFB] p-1 outline outline-[#E6E4E2] rounded-sm h-70 resize-y text-left text-black"
      ></textarea>
      <div
        className={`text-sm text-right mr-2 ${
          lyricsValue.length > 2900 ? 'text-red-500' : 'text-gray-500'
        }`}
      >
        {lyricsValue.length} / 3000
      </div>
      <input
        type="submit"
        disabled={isSubmitting}
        className="disabled:opacity-50 bg-[#E3E3E3] hover:bg-[#cbcaca] self-center text-black font-bold py-2 px-4 rounded-sm cursor-pointer"
      ></input>
    </form>
  );
}
