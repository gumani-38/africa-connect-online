import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  View,
} from "react-native";
import React from "react";
import { SafeAreaView } from "react-native";
import { Entypo, Feather, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as Animatable from "react-native-animatable";

const TermsScreen = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={styles.container}>
      <Animatable.View animation="zoomIn">
        <Text style={styles.terms}>Terms and Conditions</Text>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons style={styles.backArrow} name="chevron-back" size={30} />
        </TouchableOpacity>

        <View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.Popai}>
              Promotion of Access to Information Act 2 of 2000, as amended,
              (PAIA) and the Protection of Personal Information Act 4 of 2013
              (POPIA){" "}
            </Text>

            <Text style={styles.Consent}>
              CONSENT TO PROCESS (USE) PERSONAL INFORMATION (Informed Consent
              Notice)
            </Text>

            <Text>
              The Protection of Personal Information Act 4 of 2013 ("POPIA")
              aims to give effect to the constitutional right to privacy, whilst
              balancing this against competing rights and interests,
              particularly the right of access to information. POPIA sets out
              conditions for the lawful processing of personal information and
              seeks to regulate every step of the processing of personal
              information, from how personal information must be handled when it
              is collected until the time it is destroyed. Africa Connect Online
              (ACO) will at all times endeavour to implement processes and
              systems, and day-to-day activities to protect ACO users,
              employee's, client's and supplier's ("Data Subject") personal
              information.
            </Text>

            <Text>1.Introduction </Text>

            <Text>
              {" "}
              The Protection of Personal Information Act, 4 of 2013, ("POPIA")
              regulates and controls the processing. including the collection,
              use, and transfer of a person's personal information. In terms of
              POPIA, the ACO (Responsible Party) has a legal duty to collect,
              use, transfer and destroy (process) another's (Data Subject)
              personal information (Personal Information) in a lawful,
              legitimate and responsible manner and in accordance with the
              provisions outlined in the eight processing conditions of POPIA.
            </Text>

            <Text>2.Purpose</Text>

            <Text>
              {" "}
              In order to give effect to your commercial relationship with the
              ACO as a user's, employee, client or supplier ACO needs to process
              your Personal Information which Personal Information will be used
              for a number of legitimate purposes, including, inter-alia;
            </Text>

            <Text>
              {" "}
              In order to give effect to your commercial relationship with the
              ACO as a user’s, employee, client or supplier ACO needs to process
              your Personal Information which Personal Information will be used
              for a number of legitimate purposes, including, inter-alia;{" "}
            </Text>
            <Text>
              {" "}
              • Compliance with governing laws, corporate governance codes, and
              applicable policies.{" "}
            </Text>

            <Text> • Entering into a contract.</Text>

            <Text> • Where required by law, to disclose your information.</Text>

            <Text>
              • To communicate with you and attend to your enquiries and
              requests.
            </Text>

            <Text>
              {" "}
              • When necessary or required, to provide you with information
              about ACO.
            </Text>

            <Text>
              {" "}
              • In order to compile statistics and other analytical information.
            </Text>

            <Text>
              • Performing internal processes, such as to make payments.{" "}
            </Text>

            <Text>
              {" "}
              • To mitigate risk to ACO and eliminate fraud occurrences.
            </Text>

            <Text>
              You, the Data Subject, agrees that ACO may use all the Personal
              Information which you, the Data Subject, provides to ACO which ACO
              requires to give effect to your commercial relationship with the
              ACO.{" "}
            </Text>

            <Text>
              {" "}
              ACO in turn undertakes that it will only use your, the Data
              Subject's, Personal Information for the aforementioned purposes
              and for no other purposes, unless with your, the Data Subject's,
              prior permission.
            </Text>

            <Text>
              {" "}
              3. Withholding Consent or Withholding Personal Information
            </Text>

            <Text>
              Should you, the Data Subject, refuse to provide ACO with your
              Personal Information which is required by ACO for the purposes
              indicated above, and the required consent to process the
              aforementioned Personal Information then ACO will be unable to
              engage with you, the Data Subject, or enter into any agreement or
              relationship with you, the Data Subject. However, the Data Subject
              is required to provide the information voluntarily and understands
              that same is mandatory as described above.
            </Text>

            <Text>
              {" "}
              4. Use, Storage, Retention and Destruction of Personal Information{" "}
            </Text>

            <Text>
              {" "}
              Your, the Data Subject's, Personal Information may be processed on
              individual computers and stored electronically in a centralised
              data base, which, for operational reasons, will be accessible to
              all within ACO on a need to know and business basis, save that
              where appropriate, some of your, the Data Subject's, Personal
              Information may be retained in hard copy. All Personal Information
              which you, the Data Subject, provide to ACO will be held and/or
              stored securely. In this regard ACO undertakes to conduct regular
              audits regarding the safety and the security of your, the Data
              Subject's, Personal Information. Once your, the Data Subject's,
              Personal Information is no longer required due to the fact that
              the purpose for which the Personal Information was held has come
              to an end and expired, such Personal Information will be safely
              and securely archived as per the requirements of any law
              applicable in South Africa. ACO thereafter will ensure that such
              Personal Information is permanently destroyed.
            </Text>

            <Text> 5.Disclosure and Cross Border Transfer</Text>

            <Text>
              {" "}
              ACO may from time to time have to disclose your, the Data
              Subject's, Personal Information to other parties but such
              disclosure will always be subject to an agreement which will be
              concluded between ACO and the party to whom it is disclosing your,
              the Data Subject's, Personal Information to, which contractually
              obliges the recipient of your Personal Information to comply with
              strict confidentiality and data security conditions.
            </Text>

            <Text>
              {" "}
              Where Personal Information and related data is transferred to a
              country outside the borders of South Africa, your, the Data
              Subject's, Personal Information will only be transferred to those
              countries which have similar data privacy laws in place or where
              the recipient of the Personal Information is bound contractually
              to a no lesser set of obligations than those imposed by POPIA.{" "}
            </Text>

            <Text>6. Objections and Complaints</Text>

            <Text>
              {" "}
              You, the Data Subject, are encouraged to make immediate contact
              with the ACO Information Officer at any time if you are not
              comfortable or satisfied with the manner in which ACO is
              processing your, the Data Subject's, Personal Information. On
              receipt of your, the Data Subject's, objection ACO will place a
              hold on any further processing until the cause of the objection
              has been resolved. If you, the Data Subject, are not satisfied
              with such process, you, the Data Subject, has the right to lodge a
              complaint with the Information Regulator. Furthermore, you the
              Data Subject, have the right to request ACO to destroy all records
              of your personal information.
            </Text>

            <Text> 7. Quality and Responsibility of Personal Information</Text>

            <Text>
              {" "}
              POPIA requires that all your, the Data Subject’s, Personal
              Information and related details, as supplied by you, the Data
              Subject, are complete, accurate and up-to-date. Whilst ACO will
              always use its best endeavours to ensure that your, the Data
              Subject’s, Personal Information is reliable, it is your, the Data
              Subject’s, responsibility to provide accurate and truthful
              information and further to advise ACO of any changes to your, the
              Data Subject’s, Personal Information, as and when these may occur.
            </Text>

            <Text> 8. Data Subject's Right to Access Personal Information</Text>

            <Text>
              You, the Data Subject has the right at any time to ask ACO to
              provide you, the Data Subject, with details of the Personal
              Information which ACO holds on your, the Data Subject’s, behalf;
              and/or the purpose for which it has been used provided that such
              request is made using the ACO PAIA process, which procedure can be
              accessed by downloading and completing the standard request for
              information form, housed under the ACO’s PAIA Manual which can be
              found on the ACO website at www.africaconnectonline.com{" "}
            </Text>

            <Text> 9. ACO's Right to Amend</Text>

            <Text>
              {" "}
              ACO reserves the right to amend this Informed Consent Notice from
              time to time. You, the Data Subject are requested to please check
              the ACO website periodically to inform yourself, the Data Subject,
              of any changes.
            </Text>

            <Text> 10. Successors in Title </Text>

            <Text>
              {" "}
              The rights and obligations of the parties under this Informed
              Consent Notice will be binding on, and will be of benefit to, each
              of the parties’ successors in title and/or assigns where
              applicable, i.e. in the case of a sale or transfer of business by
              the Data Subject to another.
            </Text>

            <Text> 11. Talent Representation </Text>

            <Text>
              Africa Connect Online reserves the rights and obligations to
              represent Talents on our platform.{" "}
            </Text>

            <Text> 12. Declaration and Informed Consent </Text>

            <Text>
              {" "}
              I, the Data Subject, confirm that my, the Data Subject’s, Personal
              Information, provided is accurate, up-to- date, not misleading and
              is complete in all respects, save where same may change and then
              in such an event, I, the Data Subject, undertake to advise ACO or
              its Operator(s)1 of these changes. I, the Data Subject, in
              providing the required Personal Information to ACO and/or to its
              Operator, consent and give ACO permission to process and further
              process (where necessary and strictly directly related to the
              initial 1 “Operator” means a natural person or a juristic person
              who processes your, a Data Subject’s, Personal Information on
              behalf of ACO in terms of a contra ct or mandate, without coming
              under the direct authority of ACO; ACO will, in order to pursue
              and protect its legitimate interests and in many cases to protect
              you, the Data Subject, will under a written contract ask Operators
              to process certain categories of your, the Data Subject’s,
              Personal Information on its behalf including without detracting
              from the generality thereof, advertising agencies, research
              companies, PR agencies, Relevant Industry Associations, Payroll
              service providers, Core Benefits Providers, Medical Aid/Cover
              providers, Retirement Funding Providers, Auditors, Legal
              Practitioners, and Government and Provincial Departments.
              processing) my, the Data Subject’s, Personal Information as and
              where required and acknowledge that I, the Data Subject,
              understand the purposes for which the Personal Information is
              required and for which it will be used. Furthermore, should any of
              the Personal Information which has been provided by myself concern
              or pertain to a legal entity whom I represent, I confirm that I
              have the necessary authority to act on behalf of such legal
              entity, Data Subject, and that I have the right to provide the
              Personal Information and/or the required consent to use said
              Personal Information, on behalf of the aforementioned legal
              entity. Furthermore, should any of the Personal Information belong
              to any of my dependants and/or beneficiaries who are underage, I
              in my capacity as their legal guardian and competent person give
              ACO the appropriate permission to process their Personal
              Information for the purposes for which these details were given.
              Furthermore, I hereby consent to being contacted by ACO,
              electronically or otherwise, in order to fulfil the commercial
              relationship between myself, the Data Subject and ACO.
            </Text>

            <Text style={styles.Declaration}>CONSENT DECLARATION</Text>

            <Text>
              The Data Subject, by signing this document, hereby consents to the
              use of the Data Subject’s personal information submitted to ACO
              and confirms that:{" "}
            </Text>

            <Text>
              {" "}
              • the information is supplied voluntarily, without undue influence
              from any party and not under any duress; and{" "}
            </Text>

            <Text>
              {" "}
              • the information which is supplied is mandatory for the purposes
              of entering into a commercial agreement and that without such
              information, ACO may not enter into the agreement with the Data
              Subject.{" "}
            </Text>

            <Text>
              {" "}
              The Data Subject acknowledges that the Data Subject is aware of
              the following rights with regard to such personal information
              which is submitted to ACO. The right to:{" "}
            </Text>

            <Text>
              • access the information at any reasonable time for purposes of
              rectification thereof;{" "}
            </Text>

            <Text>
              {" "}
              • object to the processing of the information in which case the
              commercial agreement may be terminated; and{" "}
            </Text>

            <Text> • lodge a complaint to the Information Regulator. </Text>
            <Text>
              2 “underage” means a child (natural person) under the age of 18
              years who is not legally competent, without the assistance of a
              competent person, to take any action or decision in respect of any
              matter concerning him-or herself; ACO will from time to time have
              to process Personal Information of a child who may belong to you,
              a Data Subject, for amongst other reasons employment and benefit
              related purposes, which use will require the competent person’s
              consent.
            </Text>

            <Text style={styles.Policy}>COMMUNITY STANDARD POLICY </Text>

            <Text>1. Introduction </Text>

            <Text>
              {" "}
              Our community standards are designed to create a safe and
              welcoming environment for all users of our social media platform.
              We expect all users to adhere to these standards when using our
              platform.
            </Text>

            <Text>2. Prohibited content </Text>

            <Text>
              The following types of content are prohibited on our platform:{" "}
            </Text>

            <Text>
              • Hate speech: Content that promotes or incites hatred, violence,
              or discrimination against individuals or groups based on their
              race, ethnicity, nationality, religion, gender, sexual
              orientation, or other protected characteristic.{" "}
            </Text>

            <Text>
              • Harassment and bullying: Content that targets individuals with
              the intention of causing harm or distress, including
              cyberbullying, doxxing, and revenge porn.{" "}
            </Text>

            <Text>
              • Violence and graphic content: Content that depicts or promotes
              violence, self-harm, suicide, or other forms of harm.
            </Text>

            <Text>
              • Nudity and sexual content: Content that depicts nudity, sexual
              acts, or sexualized violence.
            </Text>

            <Text>
              • False information: Content that spreads false or misleading
              information that could harm individuals or the public.{" "}
            </Text>

            <Text>3. Reporting violations </Text>

            <Text>
              {" "}
              Users can report violations of our community standards by flagging
              the content or user in question. Our team will review the report
              and take appropriate action, which may include removing the
              content, disabling the user's account, or reporting the violation
              to law enforcement.{" "}
            </Text>

            <Text> 4. Consequences for violations</Text>

            <Text>
              {" "}
              Users who violate our community standards may face consequences,
              including temporary or permanent account suspension, content
              removal, or legal action. We reserve the right to take action in
              accordance with the severity and frequency of the violation.
            </Text>

            <Text>5. Appeals process </Text>

            <Text>
              {" "}
              Users who believe that their content or account was wrongly
              removed or suspended can appeal the decision by contacting our
              support team. We will review the appeal and take appropriate
              action if necessary.
            </Text>

            <Text> 6. Contact information </Text>

            <Text>
              If you have any questions or concerns about our community
              standards or their enforcement, please contact us at [insert
              contact information].Regenerate response
            </Text>
          </ScrollView>
        </View>
      </Animatable.View>
    </SafeAreaView>
  );
};

export default TermsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    paddingHorizontal: 10,
  },

  terms: {
    fontSize: 20,
    alignSelf: "center",
    fontWeight: "bold",
    color: "#000",
    marginTop: 30,
  },

  Popai: {
    fontSize: 13,
    alignSelf: "center",
    fontWeight: "bold",
    color: "#000",
    marginTop: 10,
  },

  Consent: {
    fontSize: 15,
    alignSelf: "center",
    fontWeight: "bold",
    color: "#000",
    marginTop: 10,
  },

  Declaration: {
    fontSize: 20,
    alignSelf: "center",
    fontWeight: "bold",
    color: "#000",
    marginTop: 10,
  },

  Policy: {
    fontSize: 20,
    alignSelf: "center",
    fontWeight: "bold",
    color: "#000",
    marginTop: 10,
  },

  backArrow: {
    color: "#000",
    marginTop: -20,
    alignSelf: "flex-start",
  },
});
