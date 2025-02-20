import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-[#25313C] text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">Flow2day!</h3>
            <p className="text-[#BBC8D4]">Organize your day, boost your productivity.</p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-[#BBC8D4] hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-[#BBC8D4] hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-[#BBC8D4] hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-[#BBC8D4] hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
            <p className="text-[#BBC8D4] mb-2">Email: info@flow2day.com</p>
            <div className="flex space-x-4">{/* Add social media icons here */}</div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-[#6D7D8B] text-center">
          <p className="text-[#BBC8D4]">&copy; {new Date().getFullYear()} Flow2day!. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

