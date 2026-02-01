import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-10 text-center border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          Fade District
        </h1>
        <p className="text-slate-500 text-sm mb-8">
          Make a reservation or sign in as admin
        </p>

        <div className="space-y-4">
          <Link
            to="/book/testsalon"
            className="block w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-4 px-6 rounded-xl transition duration-200 shadow-md hover:shadow-lg"
          >
            Make a reservation
          </Link>
          <Link
            to="/login"
            className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-4 px-6 rounded-xl transition duration-200 border border-slate-200"
          >
            Login as admin
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
