using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;

namespace RSAServer
{
    class Program
    {
        public static int moduloMultiply(int m, int e, int n)
        {
            int t;
            if (e == 0)
            {
                t = 1;
                return 1;
            }
            if (e % 2 == 0)
            {
                t = moduloMultiply(m, (e / 2), n);
                t =  (t * t)% n;
                return t;
            }
            else
            {
                t = (m * moduloMultiply(m, (e - 1), n)) % n;
                return t;
            }
        }
        static void Main(string[] args)
        {
            //int res = moduloMultiply(5, 12, 7);
            //int i = 5;
            RSAServer rsa = new RSAServer();

            TcpListener server = new TcpListener(System.Net.IPAddress.Parse("127.0.0.1"), 3000);
            server.Start();  // запускаем сервер
            while (true)   // бесконечный цикл обслуживания клиентов
            {
                TcpClient client = server.AcceptTcpClient();  // ожидаем подключение клиента
                NetworkStream ns = client.GetStream(); // для получения и отправки сообщений
                byte[] pubKey = new byte[100];   // любое сообщение должно быть сериализовано
                pubKey = Encoding.Default.GetBytes(rsa.getPubKeyToJSON());  // конвертируем строку в массив байт
                byte[] temp = Encoding.UTF8.GetBytes(rsa.getPubKeyToJSON());
                ns.Write(temp, 0, temp.Length);
                while (client.Connected)  // пока клиент подключен, ждем приходящие сообщения
                {
                    byte[] msg = new byte[1024];     // готовим место для принятия сообщения
                    int count = ns.Read(msg, 0, msg.Length);   // читаем сообщение от клиента
                    string res = Encoding.Default.GetString(msg, 0, count);
                    Console.Write(res);
                    Console.Write(rsa.decodeMessage(res));// выводим на экран полученное сообщение в виде строки
                }
            }


        }

       
    }

    class RSAServer
    {
        private const int primeNumberValency = 2000;
        private int eilerFunc;
        private int publicExponent;
        private int secretExponent;
        private int modulo;
        public RSAServer()
        {
            Random random = new Random();
            int prNum1 = findPrimeNumber(random);
            int prNum2 = findPrimeNumber(random);
            modulo = prNum1 * prNum2;
            eilerFunc = (prNum1 - 1) * (prNum2 - 1);
            publicExponent = getPublicExponent();
            secretExponent = getSecretExponent();
        }


        public string getPubKeyToJSON()
        {
            int[] publicKey = { publicExponent, modulo };
            return JsonSerializer.Serialize(publicKey);
        }


        private int findPrimeNumber(Random random)
        {

            int primeNumber = (int)Math.Floor((random.NextDouble() * primeNumberValency) + primeNumberValency);
            int divider = 2;
            while (divider < primeNumberValency)
            {
                if (primeNumber > 2 * primeNumberValency)
                {
                    primeNumber = findPrimeNumber(random);
                }
                if (primeNumber % divider == 0 && primeNumber > divider)
                {
                    primeNumber++;
                    divider = 1;
                }
                divider++;
            }

            return primeNumber;
        }

        private int getSecretExponent()
        {
            int a = eilerFunc;
            int b = publicExponent;
            List<int> dividers = new List<int>();

            while (a != 0 && b != 0)
            {
                if (a > b)
                {
                    dividers.Add(a / b);
                    a %= b;
                }
                else
                {
                    dividers.Add(b / a);
                    b %= a;
                }
            }

            int[] x = new int[dividers.Count];
            int[] y = new int[dividers.Count];
            x[dividers.Count - 1] = 0;
            y[dividers.Count - 1] = 1;

            for (int i = x.Length - 2; i > -1; i--)
            {
                x[i] = y[i + 1];
                y[i] = x[i + 1] - y[i + 1] * dividers[i];
            }

            return y[0] > 0 
                ? y[0] % eilerFunc 
                : y[0] % eilerFunc + eilerFunc;
        }

        public int getPublicExponent()
        {
            int[] exps = { 5, 7, 11, 17, 23, 29, 31 };
		    foreach (int e in exps)
            {
                if (eilerFunc % e != 0)
                {
                    return e;
                }
            }

            return -1;
        }

        private long moduloMultiply(int m, int e, int n)
        {
            if (e == 0)
            {
                return 1;
            }
            if (e % 2 == 0)
            {
                long t;
                t = moduloMultiply(m, (e / 2), n);
                t = (t * t) % n;
                Console.WriteLine("/2");
                return t;
            }
            else
            {
                long t;
                t = (m * moduloMultiply(m, (e - 1), n)) % n;
                Console.WriteLine("-1");
                return t;
            }
        }

        public string decodeMessage(string jsonMsg)
        {
            Console.WriteLine("json msg is " + jsonMsg);
            int[] msg = JsonSerializer.Deserialize<int[]>(jsonMsg);
            long[] t = new long[msg.Length];
            byte[] decodedMessage = new byte[msg.Length - 1];
            long decodedSymbol = 0;
            for (int m = 0; m < msg.Length; m++)
            {
                long a = moduloMultiply(msg[m], secretExponent, modulo);
                t[m] = a;
                if (m > 0)
                {
                    decodedSymbol = (a - t[m - 1]) > 0 
                        ? (a - t[m - 1]) % modulo 
                        : ((a - t[m - 1]) % modulo) + modulo;
                    decodedMessage[m - 1] = (byte)decodedSymbol;
                }
                else
                {
                    decodedSymbol = a;
                }
            }
            
            return Encoding.UTF8.GetString(decodedMessage);
        }
    }


}
