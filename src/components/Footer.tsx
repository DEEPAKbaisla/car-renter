
import { Facebook, Instagram } from "lucide-react";



const Footer = () => {
  return (
    <footer className=" px-6 md:px-16 lg:px-24 py-12">
      
      <div className="grid md:grid-cols-3 gap-10">
        
        {/* Brand Section */}
        <div>
          <h2 className="text-3xl font-bold text-grey-500">RideOwn</h2>
          <p className="mt-3 text-sm text-zinc-400 max-w-sm">
            Rent your dream car with ease. Transparent pricing, flexible rentals,
            and a seamless booking experience.
          </p>

          {/* Socials */}
          <div className="flex gap-4 mt-5">
            <div className="w-9 h-9 text-blue-300 rounded-2xl flex items-center justify-center hover:bg-white transition">
              <Facebook  />
            </div>
             <div className="w-9 h-9 text-red-400 rounded-2xl flex items-center justify-center hover:bg-white transition">
              <Instagram />
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="flex justify-between md:justify-around">
          
          <div>
            <h3 className="text-grey-500 font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-gray-500 cursor-pointer">About</li>
              <li className="hover:text-gray-500 cursor-pointer">Careers</li>
              <li className="hover:text-gray-500 cursor-pointer">Contact</li>
            </ul>
          </div>

          <div>
            <h3 className=" font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-gray-500 cursor-pointer">Help Center</li>
              <li className="hover:text-gray-500 cursor-pointer">Terms</li>
              <li className="hover:text-gray-500 cursor-pointer">Privacy</li>
            </ul>
          </div>

        </div>

        {/* CTA */}
        <div>
          <h3 className="text-grey-500 font-semibold mb-4">
            Start your journey today 🚗
          </h3>
          <p className="text-sm text-zinc-400 mb-4">
            Browse and book cars instantly.
          </p>

          <button className="bg-amber-400 text-white px-5 py-2 rounded-lg font-medium hover:bg-amber-300 transition">
            Browse Cars
          </button>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-zinc-700 mt-10 pt-6 text-center text-sm text-zinc-500">
        © 2025 RideOwn. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;